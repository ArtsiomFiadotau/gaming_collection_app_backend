import { createServer } from 'http';
import app from './app';
const port = process.env.PORT || 1537;

const server = createServer(app);

server.listen(port);