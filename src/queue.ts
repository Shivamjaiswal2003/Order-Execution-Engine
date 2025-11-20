import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

export const orderQueue = new Queue('orders', { connection });

// Simple worker stub (does nothing yet)
export const orderWorker = new Worker(
  'orders',
  async (job) => {
    console.log('Processing dummy job', job.id);
  },
  { connection, concurrency: 10 }
);

