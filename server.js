import cluster from 'cluster';
import os from 'os';
import app from './app.js';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }

  // Track restart attempts to prevent infinite loops
  const restartAttempts = new Map();
  const MAX_RESTART_ATTEMPTS = 5;
  const RESTART_DELAY = 5000; // 5 seconds

  cluster.on('exit', (worker, code, signal) => {
    const workerId = worker.process.pid;
    const attempts = restartAttempts.get(workerId) || 0;
    
    console.log(`Worker ${workerId} died with code ${code} and signal ${signal}`);
    
    if (attempts < MAX_RESTART_ATTEMPTS) {
      console.log(`Restarting worker ${workerId} (attempt ${attempts + 1}/${MAX_RESTART_ATTEMPTS})`);
      restartAttempts.set(workerId, attempts + 1);
      
      // Delay before restarting to prevent rapid restart loops
      setTimeout(() => {
        const newWorker = cluster.fork();
        restartAttempts.set(newWorker.process.pid, 0); // Reset attempts for new worker
      }, RESTART_DELAY);
    } else {
      console.error(`Worker ${workerId} exceeded maximum restart attempts. Not restarting.`);
      restartAttempts.delete(workerId);
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    process.exit(0);
  });

  // Handle SIGTERM for production deployments
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
    process.exit(0);
  });

} else {
  // Workers can share any TCP connection
  const PORT = process.env.PORT || 3000;
  
  const server = app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started on port ${PORT}`);
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Worker ${process.pid}: Port ${PORT} is already in use. Exiting gracefully.`);
      process.exit(0); // Exit gracefully instead of error
    } else {
      console.error(`Worker ${process.pid}: Server error:`, error);
      process.exit(1);
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error(`Worker ${process.pid}: Uncaught Exception:`, error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error(`Worker ${process.pid}: Unhandled Rejection at:`, promise, 'reason:', reason);
    process.exit(1);
  });

  // Handle worker-specific signals
  process.on('SIGTERM', () => {
    console.log(`Worker ${process.pid}: Received SIGTERM, shutting down...`);
    server.close(() => {
      process.exit(0);
    });
  });
} 