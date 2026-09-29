/**
 * KDP Generator API Server
 * Simple HTTP server for health checks and future API integration
 */

import 'dotenv/config';
import http from 'http';
import { KDPGenerator } from './index.js';

const PORT = parseInt(process.env.API_PORT || '3000', 10);
const generator = new KDPGenerator();

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'kdp-generator-api' }));
  } else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('KDP Generator API Server\nUse /health for health checks');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log('🚀 KDP Generator API Server');
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`🗄️  Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`📦 Database name: ${process.env.DB_DATABASE}`);
  console.log('✓ Server initialized and ready');
});

process.on('SIGINT', () => {
  console.log('\n✓ Shutting down gracefully...');
  server.close(() => process.exit(0));
});
