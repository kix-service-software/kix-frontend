import { container } from './Container';
import { Server } from './Server';

// tslint:disable-next-line:no-var-requires
require('babel-polyfill');

process.setMaxListeners(0);

export async function initApplication(): Promise<void> {
    await container.initialize();
    const server = container.getDIContainer().get<Server>("Server");
}

initApplication();
