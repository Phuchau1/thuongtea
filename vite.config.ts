import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

function persistentApiPlugin(): Plugin {
  const dbDir = path.resolve(process.cwd(), 'data')
  const dbFile = path.resolve(dbDir, 'db.json')

  const readDb = () => {
    try {
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
      }
      if (!fs.existsSync(dbFile)) {
        const initial = { orders: [], members: [], products: [], attendance: [] }
        fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2), 'utf-8')
        return initial
      }
      const raw = fs.readFileSync(dbFile, 'utf-8')
      return JSON.parse(raw)
    } catch (e) {
      console.error('Error reading db.json', e)
      return { orders: [], members: [], products: [], attendance: [] }
    }
  }

  const writeDb = (data: any) => {
    try {
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
      }
      fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8')
    } catch (e) {
      console.error('Error writing db.json', e)
    }
  }

  return {
    name: 'persistent-api-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          return next()
        }

        const url = new URL(req.url, 'http://localhost')
        const pathname = url.pathname
        const method = req.method

        const sendJson = (statusCode: number, payload: any) => {
          res.statusCode = statusCode
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          res.end(JSON.stringify(payload))
        }

        if (method === 'OPTIONS') {
          return sendJson(200, { ok: true })
        }

        const getBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {})
              } catch {
                resolve({})
              }
            })
          })
        }

        // GET /api/orders
        if (pathname === '/api/orders' && method === 'GET') {
          const db = readDb()
          return sendJson(200, { success: true, data: db.orders || [] })
        }

        // POST /api/orders (Tạo hoặc cập nhật đơn, tránh trùng lặp)
        if (pathname === '/api/orders' && method === 'POST') {
          getBody().then(newOrder => {
            const db = readDb()
            db.orders = db.orders || []
            const existingIndex = db.orders.findIndex((o: any) => o.id === newOrder.id)
            if (existingIndex >= 0) {
              db.orders[existingIndex] = { ...db.orders[existingIndex], ...newOrder }
            } else {
              db.orders.unshift(newOrder)
            }
            writeDb(db)
            return sendJson(200, { success: true, data: newOrder })
          })
          return
        }

        // POST /api/orders/check/:id (Check và nhận đơn 1 lần duy nhất)
        if (pathname.startsWith('/api/orders/check/') && method === 'POST') {
          const orderId = pathname.replace('/api/orders/check/', '')
          const db = readDb()
          db.orders = db.orders || []
          let updatedOrder = null
          db.orders = db.orders.map((o: any) => {
            if (o.id === orderId) {
              updatedOrder = { 
                ...o, 
                checked: true, 
                status: 'preparing', 
                checkedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
              }
              return updatedOrder
            }
            return o
          })
          writeDb(db)
          return sendJson(200, { success: true, data: updatedOrder })
        }

        // POST /api/orders/clear-duplicates (Dọn dẹp đơn trùng lặp)
        if (pathname === '/api/orders/clear-duplicates' && method === 'POST') {
          const db = readDb()
          const seen = new Set()
          const uniqueOrders = []
          for (const o of (db.orders || [])) {
            const key = o.id
            if (!seen.has(key)) {
              seen.add(key)
              uniqueOrders.push(o)
            }
          }
          db.orders = uniqueOrders
          writeDb(db)
          return sendJson(200, { success: true, data: uniqueOrders })
        }

        // PUT /api/orders/:id (Cập nhật thông tin đơn hàng)
        if (pathname.startsWith('/api/orders/') && method === 'PUT') {
          const orderId = pathname.replace('/api/orders/', '')
          getBody().then(updates => {
            const db = readDb()
            db.orders = db.orders || []
            let found = null
            db.orders = db.orders.map((o: any) => {
              if (o.id === orderId) {
                found = { ...o, ...updates }
                return found
              }
              return o
            })
            writeDb(db)
            return sendJson(200, { success: true, data: found })
          })
          return
        }

        // POST /api/tables/clear (Dọn trả bàn trống)
        if (pathname === '/api/tables/clear' && method === 'POST') {
          getBody().then(({ tableNumber }) => {
            const db = readDb()
            db.orders = db.orders || []
            db.orders = db.orders.map((o: any) => {
              if (o.tableNumber === tableNumber && !o.tableCleared) {
                return { ...o, tableCleared: true }
              }
              return o
            })
            writeDb(db)
            return sendJson(200, { success: true })
          })
          return
        }

        // GET & POST /api/members
        if (pathname === '/api/members' && method === 'GET') {
          const db = readDb()
          return sendJson(200, { success: true, data: db.members || [] })
        }

        if (pathname === '/api/members' && method === 'POST') {
          getBody().then(member => {
            const db = readDb()
            db.members = db.members || []
            const idx = db.members.findIndex((m: any) => m.phone === member.phone)
            if (idx >= 0) {
              db.members[idx] = { ...db.members[idx], ...member }
            } else {
              db.members.push(member)
            }
            writeDb(db)
            return sendJson(200, { success: true, data: member })
          })
          return
        }

        // GET & POST /api/products
        if (pathname === '/api/products' && method === 'GET') {
          const db = readDb()
          return sendJson(200, { success: true, data: db.products || [] })
        }

        if (pathname === '/api/products' && method === 'POST') {
          getBody().then(({ products }) => {
            const db = readDb()
            db.products = products
            writeDb(db)
            return sendJson(200, { success: true })
          })
          return
        }

        // GET & POST /api/toppings
        if (pathname === '/api/toppings' && method === 'GET') {
          const db = readDb()
          return sendJson(200, { success: true, data: db.toppings || [] })
        }

        if (pathname === '/api/toppings' && method === 'POST') {
          getBody().then(({ toppings }) => {
            const db = readDb()
            db.toppings = toppings
            writeDb(db)
            return sendJson(200, { success: true })
          })
          return
        }

        // GET & POST /api/tables
        if (pathname === '/api/tables' && method === 'GET') {
          const db = readDb()
          return sendJson(200, { success: true, data: db.tables || [] })
        }

        if (pathname === '/api/tables' && method === 'POST') {
          getBody().then(({ tables }) => {
            const db = readDb()
            db.tables = tables
            writeDb(db)
            return sendJson(200, { success: true })
          })
          return
        }

        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), persistentApiPlugin()],
})
