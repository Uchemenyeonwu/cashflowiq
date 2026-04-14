import { startSyncWorker, closeSyncWorker, closeSyncQueue } from '@/lib/queue';
import { closeRedisClient } from '@/lib/redis';

async function startWorker() {
  try {
    console.log('Starting BullMQ worker...');
    await startSyncWorker();
    console.log('BullMQ worker is running. Press Ctrl+C to stop.');
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\nShutting down worker...');
  try {
    await closeSyncWorker();
    await closeSyncQueue();
    await closeRedisClient();
    console.log('Worker shut down gracefully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startWorker();
