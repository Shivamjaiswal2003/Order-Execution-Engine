# 🚀 Order Execution Engine — Market Order with DEX Routing & WebSocket Updates

This project implements a complete **Order Execution Engine** for executing market orders and streaming real-time updates over WebSocket.  
It follows the full requirements of **Backend Task 2 — Order Execution Engine**.

✔ Market order execution  
✔ Real-time price routing  
✔ BullMQ queue worker  
✔ WebSocket streaming  
✔ PostgreSQL persistence  
✔ CORS-enabled  
✔ Supports Raydium & Meteora mock routing  

---

# 🧠 Why Market Order?

I chose **Market Orders** because:

- They execute immediately.
- They simplify fulfillment logic.
- They suit a real-time order-processing engine.
- Best match for routing + WebSocket streaming.

### Extensions (for future work)

- **Limit Order:** Worker checks real-time price conditions before executing.  
- **Sniper Order:** Worker monitors token launch or pool creation, instantly triggers swap.

---

# 📦 Tech Stack

| Component     | Technology |
|---------------|------------|
| Language      | Node.js + TypeScript |
| Web Server    | Fastify |
| WebSockets    | @fastify/websocket |
| Queue System  | BullMQ + Redis |
| Database      | PostgreSQL |
| DEX Router    | Mock Raydium + Meteora |
| Deployment    | Compatible with Render / Railway / AWS |

---

# 🏗 Architecture Overview

```
Client (HTTP POST /execute)
        ↓
API Server (Fastify)
        ↓
Persist order → Add to Queue
        ↓
BullMQ Worker
        ↓
Raydium+Meteora quote comparison
        ↓
Build transaction
        ↓
Simulate execution (txHash + executedPrice)
        ↓
Emit WebSocket events in real-time
        ↓
Update PostgreSQL status
```

---

# 📡 WebSocket Status Events

Each order streams lifecycle updates:

```
pending     → Order accepted & queued
routing     → Fetching Raydium & Meteora prices
building    → Creating transaction payload
submitted   → Transaction broadcasted
confirmed   → Execution complete
failed      → Error occurred
```

---

# 🧬 Project Structure

```
src/
 ├── index.ts        # Fastify server, WebSocket & bootstrap
 ├── routes.ts       # HTTP API + WS endpoint
 ├── queue.ts        # BullMQ queue + worker
 ├── dexRouter.ts    # Raydium & Meteora mock router
 ├── db.ts           # PostgreSQL wrapper
 ├── events.ts       # EventEmitter for real-time events
 ├── types.ts        # Shared TS types
test-ws.html         # Manual WebSocket testing tool
```

---

# ⚙️ Setup Instructions

## 1️⃣ Install prerequisites

- Node.js 18+
- Redis (local or cloud)
- PostgreSQL / Neon / Supabase

## 2️⃣ Clone the repo

```bash
git clone <your_repo_url>
cd order-execution-engine
```

## 3️⃣ Install dependencies

```bash
npm install
```

## 4️⃣ Create `.env`

```
PORT=3000
REDIS_URL=redis://127.0.0.1:6379
DATABASE_URL=postgres://<user>:<pass>@<host>/<db>?sslmode=require
```

## 5️⃣ Start development server

```bash
npm run dev
```

---

# 🧪 Testing API

## Create order (PowerShell friendly)

```powershell
(Invoke-WebRequest `
 -Uri "http://localhost:3000/api/orders/execute" `
 -Method POST `
 -Headers @{ "Content-Type"="application/json" } `
 -Body '{"tokenIn":"SOL","tokenOut":"USDC","amount":1.5,"side":"buy"}').Content
```

Response:

```json
{
  "orderId": "xxxx-xxxx",
  "message": "Order accepted. Connect via WebSocket.",
  "wsUrl": "/ws/orders/<orderId>"
}
```

---

# 📡 Test WebSockets

Open `test-ws.html` in your browser.

You can:

✔ Create new order  
✔ Listen for its updates  
✔ Observe full lifecycle in real time  

---

# 📊 DEX Routing Logic

The system compares:

- **Raydium quote**
- **Meteora quote**

Both return:

- Price
- Fee
- Randomized simulated slippage

Best DEX is chosen using:

```
bestPrice = max(ray.quote, meteora.quote)
```

---

# 🔄 Queue & Worker Behavior

✔ Concurrency = 10  
✔ Retries = 3  
✔ Exponential backoff  
✔ Automatic status updates  
✔ WebSocket event emission  
✔ DB persisted state transitions  

---

# 🗄 PostgreSQL Schema (Required)

```
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  token_in TEXT NOT NULL,
  token_out TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  side TEXT NOT NULL,
  status TEXT NOT NULL,
  dex TEXT,
  executed_price NUMERIC,
  tx_hash TEXT,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# 🧱 Example Worker Log

```
pending → routing → building → submitted → confirmed
Executed on: Raydium
txHash: 0xabc123...
executedPrice: 1.0034
```

---

# 🧪 Test Cases to Include (Required)

- API validation
- Worker job execution
- Multiple simultaneous jobs (concurrency)
- Raydium vs Meteora routing logic
- WebSocket event lifecycle
- DB writes on each status change

---


# 📹 Demo Video (Required)

https://www.youtube.com/watch?v=zklr0xlGbaQ