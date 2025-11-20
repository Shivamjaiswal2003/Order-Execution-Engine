import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { registerRoutes } from './routes';
import { initDb } from './db';
import './queue';

dotenv.config();

async function start() {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS']
  });

  await app.register(websocket);

  await registerRoutes(app);

  await initDb();

  const port = Number(process.env.PORT) || 3000;
  const host = '0.0.0.0';

  try {
    await app.listen({ port, host });
    console.log(`🚀 Server running at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
