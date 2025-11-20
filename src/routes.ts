import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { orderQueue, defaultJobOptions } from './queue';
import { insertOrder } from './db';
import { CreateOrderRequest, Order } from './types';
import { orderEvents } from './events';

export async function registerRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateOrderRequest }>(
    '/api/orders/execute',
    async (request, reply) => {
      const { tokenIn, tokenOut, amount, side } = request.body;

      if (!tokenIn || !tokenOut || !amount || !side) {
        return reply.status(400).send({ error: 'Invalid request body' });
      }

      const id = randomUUID();

      const order: Order = {
        id,
        type: 'market',
        tokenIn,
        tokenOut,
        amount,
        side,
        status: 'pending'
      };

      await insertOrder(order);

      // enqueue
      await orderQueue.add('execute-order', order, defaultJobOptions);

      return reply.status(200).send({
        orderId: id,
        message: 'Order accepted. Connect via WebSocket for updates.',
        wsUrl: `/ws/orders/${id}`
      });
    }
  );

  // WebSocket
  app.get(
    '/ws/orders/:orderId',
    { websocket: true },
    (socket, req) => {
      const { orderId } = req.params as { orderId: string };

      console.log(`🔌 WebSocket connected for order ${orderId}`);

      socket.send(JSON.stringify({
        orderId,
        status: 'pending',
        info: 'Subscribed to order updates'
      }));

      const listener = (update: any) => {
        if (socket.readyState === 1) {
          socket.send(JSON.stringify(update));
        }
      };

      orderEvents.on(`order-updated:${orderId}`, listener);

      socket.on('close', () => {
        orderEvents.off(`order-updated:${orderId}`, listener);
        console.log(`🔌 WebSocket disconnected for order ${orderId}`);
      });
    }
  );

  // (optional) keep /health route
  app.get('/health', async () => ({ status: 'ok' }));
}
