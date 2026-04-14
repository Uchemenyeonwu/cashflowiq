import { Queue, Worker } from 'bullmq';
import { getRedisClient } from './redis';
import { syncPlaidTransactions } from './plaid-sync';

let syncQueue: Queue | null = null;
let syncWorker: Worker | null = null;

export async function getSyncQueue() {
  if (syncQueue) {
    return syncQueue;
  }

  try {
    const redis = await getRedisClient();
    
    syncQueue = new Queue('plaid-sync', {
      connection: redis as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600, // keep completed jobs for 1 hour
        },
        removeOnFail: {
          age: 86400, // keep failed jobs for 24 hours
        },
      },
    });

    console.log('Sync queue initialized');
    return syncQueue;
  } catch (error) {
    console.error('Failed to initialize sync queue:', error);
    throw error;
  }
}

export async function startSyncWorker() {
  if (syncWorker) {
    return syncWorker;
  }

  try {
    const redis = await getRedisClient();

    syncWorker = new Worker(
      'plaid-sync',
      async (job) => {
        console.log(`Processing job ${job.id}: sync account ${job.data.linkedAccountId}`);
        
        try {
          await syncPlaidTransactions(job.data.linkedAccountId);
          console.log(`Job ${job.id} completed successfully`);
          return { success: true };
        } catch (error: any) {
          console.error(`Job ${job.id} failed:`, error);
          throw error;
        }
      },
      {
        connection: redis as any,
        concurrency: 2, // Process max 2 jobs concurrently
      }
    );

    syncWorker.on('completed', (job) => {
      console.log(`Job ${job.id} has been completed`);
    });

    syncWorker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} has failed:`, err);
    });

    syncWorker.on('error', (err) => {
      console.error('Worker error:', err);
    });

    console.log('Sync worker started');
    return syncWorker;
  } catch (error) {
    console.error('Failed to start sync worker:', error);
    throw error;
  }
}

export async function enqueueSyncJob(linkedAccountId: string) {
  try {
    const queue = await getSyncQueue();
    const job = await queue.add(
      `sync-${linkedAccountId}`,
      { linkedAccountId },
      {
        jobId: `sync-${linkedAccountId}-${Date.now()}`,
      }
    );
    console.log(`Enqueued sync job for account ${linkedAccountId}:`, job.id);
    return job;
  } catch (error) {
    console.error(`Failed to enqueue sync job for account ${linkedAccountId}:`, error);
    throw error;
  }
}

export async function closeSyncWorker() {
  if (syncWorker) {
    await syncWorker.close();
    syncWorker = null;
  }
}

export async function closeSyncQueue() {
  if (syncQueue) {
    await syncQueue.close();
    syncQueue = null;
  }
}
