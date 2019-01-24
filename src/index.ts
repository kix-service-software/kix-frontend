import { Server } from './Server';
import { KIXExtensions, IConfigurationExtension } from './core/extensions';
import { PluginService } from './services';
import { CoreServiceRegistry, ConfigurationService } from './core/services';

process.setMaxListeners(0);

class Startup {

    private server: Server;

    public constructor() {
        this.initApplication();
    }

    private async initApplication(): Promise<void> {
        const configDir = __dirname + '/../config/';
        const certDir = __dirname + '/../cert/';
        ConfigurationService.getInstance().init(configDir, certDir);

        await this.bindServices();
        this.server = Server.getInstance();
    }

    private async bindServices(): Promise<void> {
        await CoreServiceRegistry.registerCoreServices();
    }

}
const startup = new Startup();
