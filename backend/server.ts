
/**
 * Entry point of the backend server application.
 *
 * - Loads environment variables from '.env' file.
 * - Imports the Express app from source.
 * - Creates and starts an HTTP server listening on the specified port.
 */

// Load environment variables from .env file into process.env
import dotenv from 'dotenv';
dotenv.config();

// Import Node.js built-in HTTP module
import http from 'http';

// Import the Express application instance
import app from './src/app';

// Use PORT from environment or default to 5000
const PORT = process.env.PORT || 5000;

// Create an HTTP server wrapping the Express app
const server = http.createServer(app);

// Start the server and listen on the defined PORT
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

//Handle server errors gracefully
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle graceful shutdown signals (e.g., Ctrl+C)
process.on('SIGINT', () => {
  console.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
