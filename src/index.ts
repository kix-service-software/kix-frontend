import { Server } from './Server';
import { KIXExtensions, IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { PluginService } from './services';
import { CoreServiceRegistry, ConfigurationService } from '@kix/core/dist/services';

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
        await this.registerModules();
        this.server = Server.getInstance();
    }

    private async bindServices(): Promise<void> {
        await CoreServiceRegistry.getInstance().registerCoreServices();
    }

    private async registerModules(): Promise<void> {
        const moduleFactories = await PluginService.getInstance().getExtensions<IModuleFactoryExtension>(
            KIXExtensions.MODUL
        );
        moduleFactories.forEach((mf) => mf.createFormDefinitions());
    }

}
const startup = new Startup();
