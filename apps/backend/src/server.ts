import 'dotenv/config';
import 'reflect-metadata';
import build from './app';

const start = async (): Promise<void> => {
  const app = build();

  try {
    const host = process.env.HOST || '0.0.0.0';
    const port = parseInt(process.env.PORT || '3000');

    await app.listen({ port, host });
    app.log.info(`Server listening on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  // eslint-disable-next-line no-console
  console.log('\nReceived SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  // eslint-disable-next-line no-console
  console.log('\nReceived SIGTERM. Graceful shutdown...');
  process.exit(0);
});

start();
