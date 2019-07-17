import { Server } from './Server';
import { CoreServiceRegistry, ConfigurationService } from './core/services';
import { PluginService } from './services';

import path = require('path');

process.setMaxListeners(0);

class Startup {

    private server: Server;

    public constructor() {
        this.initApplication();
    }

    private async initApplication(): Promise<void> {
        const configDir = path.join(__dirname, '..', 'config');
        const certDir = path.join(__dirname, '..', 'cert');
        ConfigurationService.getInstance().init(configDir, certDir);

        PluginService.getInstance().init(['extensions']);

        this.server = Server.getInstance();
        await this.server.initServer();
        await this.bindServices();
        await this.server.initHttpServer();
    }

    private async bindServices(): Promise<void> {
        await CoreServiceRegistry.registerCoreServices();
    }

}
const startup = new Startup();
