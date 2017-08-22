import { container } from './Container';
import { Server } from './Server';

const server = container.get<Server>("Server");
