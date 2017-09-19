import { container } from './Container';
import { Server } from './Server';

process.setMaxListeners(0);

export async function initApplication(): Promise<void> {
    await container.initialize();
    const server = container.getDIContainer().get<Server>("Server");
}

initApplication();
