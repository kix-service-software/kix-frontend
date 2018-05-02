import { ServiceContainer, ICommunicator, IService } from '@kix/core/dist/common';
import { Server } from './Server';
import { IRouter } from '@kix/core/dist/routes';
import { AuthenticationRouter, ApplicationRouter } from './routes';
import {
    IRouterExtension, KIXExtensions, ICommunicatorRegistryExtension, IServiceRegistryExtension, IModuleFactoryExtension
} from '@kix/core/dist/extensions';
import { MarkoService, PluginService } from './services';
import { IPluginService, CoreServiceRegistry } from '@kix/core/dist/services';

process.setMaxListeners(0);

class Startup {

    private server: Server;

    public constructor() {
        this.initApplication();
    }

    private async initApplication(): Promise<void> {
        ServiceContainer.getInstance().configurationDirectory = __dirname + '/../config/';
        ServiceContainer.getInstance().certDirectory = __dirname + '/../cert/';

        await this.bindServices();
        await this.bindRouters();
        await this.bindCommunicators();
        await this.registerModules();
        ServiceContainer.getInstance().register<Server>('Server', Server);
        this.server = ServiceContainer.getInstance().getClass<Server>('Server');
    }

    private async bindServices(): Promise<void> {
        const container = ServiceContainer.getInstance();
        container.register<IService>('IPluginService', PluginService);
        container.register<IService>('IMarkoService', MarkoService);

        CoreServiceRegistry.getInstance().registerCoreServices();

        const pluginService = ServiceContainer.getInstance().getClass<IPluginService>('IPluginService');
        const servicesExtensions = await pluginService.getExtensions<IServiceRegistryExtension>(KIXExtensions.SERVICES);
        for (const registry of servicesExtensions) {
            registry.getServices().forEach((serviceClass, serviceName) => {
                container.register(serviceName, serviceClass);
            });
        }
    }

    private async bindRouters(): Promise<void> {
        ServiceContainer.getInstance().register<IRouter>('IRouter', AuthenticationRouter);
        ServiceContainer.getInstance().register<IRouter>('IRouter', ApplicationRouter);

        const pluginService = ServiceContainer.getInstance().getClass<IPluginService>('IPluginService');
        const routerExtensions = await pluginService.getExtensions<IRouterExtension>(KIXExtensions.ROUTER);

        for (const routerExt of routerExtensions) {
            ServiceContainer.getInstance().register<IRouter>('IRouter', routerExt.getRouterClass());
        }
    }

    private async bindCommunicators(): Promise<void> {
        const pluginService = ServiceContainer.getInstance().getClass<IPluginService>('IPluginService');
        const communicatorExtensions = await pluginService
            .getExtensions<ICommunicatorRegistryExtension>(KIXExtensions.COMMUNICATOR);

        const container = ServiceContainer.getInstance();
        for (const communicator of communicatorExtensions) {
            communicator.getCommunicatorClasses().forEach(
                (c) => container.register<ICommunicator>('ICommunicator', c)
            );
        }
    }

    private async registerModules(): Promise<void> {
        const pluginService = ServiceContainer.getInstance().getClass<IPluginService>('IPluginService');
        const moduleFactories = await pluginService.getExtensions<IModuleFactoryExtension>(KIXExtensions.MODUL);
        moduleFactories.forEach((mf) => mf.createFormDefinitions());
    }

}
const startup = new Startup();
