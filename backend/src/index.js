import app from './app.js'

const PORT = 3001

const server = app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

// Handle SIGINT signal from Ctrl+C
process.on('SIGINT', () => {
  console.log('Received SIGINT. Gracefully shutting down...');
  server.close((err) => {
    if (err) {
      console.error('Error during shutdown:', err);
      process.exit(1); // Exit with error code
    }
    console.log('Server closed. Exiting process.');
    process.exit(0); // Exit successfully
  });
});