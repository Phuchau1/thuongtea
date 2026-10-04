import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

dotenv.config();

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB_NAME || 'thuongtea';

let client = null;
let dbInstance = null;
let isConnecting = false;

// Local fallback file path if MongoDB URI is not yet configured or during initial setup
const localDataDir = path.resolve(process.cwd(), 'data');
const localDbFile = path.resolve(localDataDir, 'db.json');

function getLocalData() {
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
    }
    if (!fs.existsSync(localDbFile)) {
      const initial = {
        orders: [],
        members: [],
        products: [],
        toppings: [],
        tables: [],
        staff: [],
        attendance: [],
        coupons: [],
        stock: {}
      };
      fs.writeFileSync(localDbFile, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(localDbFile, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Fallback] Error reading local db.json:', err);
    return { orders: [], members: [], products: [], toppings: [], tables: [], staff: [], attendance: [], coupons: [], stock: {} };
  }
}

function saveLocalData(data) {
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
    }
    fs.writeFileSync(localDbFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Fallback] Error saving local db.json:', err);
  }
}

export async function connectToDatabase() {
  if (dbInstance) {
    return { db: dbInstance, isMongo: true };
  }

  if (!uri || uri.trim() === '') {
    console.warn('[MongoDB Atlas] MONGODB_URI is not set. Operating in local-persistent mode (data/db.json).');
    return { db: null, isMongo: false };
  }

  if (isConnecting) {
    // Wait momentarily for existing connection promise
    await new Promise((r) => setTimeout(r, 200));
    if (dbInstance) return { db: dbInstance, isMongo: true };
  }

  isConnecting = true;
  try {
    console.log('[MongoDB Atlas] Connecting to cluster...');
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
    });

    await client.connect();
    dbInstance = client.db(dbName);
    console.log(`[MongoDB Atlas] Successfully connected to database: "${dbName}"!`);

    // Ensure unique indexes for fast lookups
    try {
      await dbInstance.collection('orders').createIndex({ id: 1 }, { unique: true });
      await dbInstance.collection('members').createIndex({ phone: 1 }, { unique: true });
      await dbInstance.collection('staff').createIndex({ id: 1 });
      await dbInstance.collection('attendance').createIndex({ id: 1 });
      await dbInstance.collection('config').createIndex({ key: 1 }, { unique: true });
    } catch (idxErr) {
      console.debug('[MongoDB Atlas] Indexes check/creation:', idxErr.message);
    }

    isConnecting = false;
    return { db: dbInstance, isMongo: true };
  } catch (err) {
    isConnecting = false;
    console.error('[MongoDB Atlas] Connection failed:', err.message);
    console.warn('[MongoDB Atlas] Falling back to local data storage to ensure uninterrupted service.');
    return { db: null, isMongo: false };
  }
}

export function getDatabase() {
  return { db: dbInstance, isMongo: !!dbInstance, getLocalData, saveLocalData };
}
