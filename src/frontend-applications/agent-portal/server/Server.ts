/**
 * Copyright (C) 2006-2026 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FastifyInstance } from 'fastify';
import { ConfigurationService } from '../../../server/services/ConfigurationService';
import { SysConfigService } from '../modules/sysconfig/server/SysConfigService';
import { MainMenuService } from './services/MainMenuService';
import path from 'path';
import { CacheService } from './services/cache';
import { PluginService } from '../../../server/services/PluginService';
import { AgentPortalExtensions } from './extensions/AgentPortalExtensions';
import { IConfigurationExtension } from './extensions/IConfigurationExtension';
import { ConfigurationCache } from './api/context/ConfigurationCache';
import { ConfigurationBuilder } from './api/config/ConfigurationBuilder';
import { IMarkoApplication } from './extensions/IMarkoApplication';
import { FileService } from '../modules/file/server/FileService';
import { AbstractServer } from './AbstractServer';
import { registerAuthenticationModule } from './routes/FastifyAuthentication';

export class Server extends AbstractServer {

    public readonly name = 'Agent Portal';
    public readonly serverPrefix = 'AP';

    private static INSTANCE: Server;

    public static getInstance(): Server {
        if (!Server.INSTANCE) {
            Server.INSTANCE = new Server();
        }
        return Server.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async initialize(): Promise<void> {
        await super.initialize();
    }

    protected async preInitialize(): Promise<void> {
        await this.registerForms();
        MainMenuService.createDefaultConfiguration(ConfigurationService.getBackendAPIToken());
        SysConfigService.getInstance().preloadOptions();

        await this.initCacheDependencies();
        await ConfigurationBuilder.rebuildConfigCache().catch(() => null);
        await ConfigurationCache.getInstance().rebuildConfigCache().catch(() => null);
    }

    private async initCacheDependencies(): Promise<void> {
        const applications = await PluginService.getInstance().getExtensions<IMarkoApplication>(
            AgentPortalExtensions.MARKO_APPLICATION
        ).catch((): IMarkoApplication[] => []);

        for (const application of applications) {
            CacheService.getInstance().adddIgnorePrefixes([`${application.name}ContextConfiguration`]);
        }
    }

    private async registerForms(): Promise<void> {
        CacheService.getInstance().adddIgnorePrefixes(['FormConfiguration']);
        const extensions = await PluginService.getInstance().getExtensions<IConfigurationExtension>(
            AgentPortalExtensions.CONFIGURATION
        ).catch((): IConfigurationExtension[] => []);

        const promises = extensions.map((e) => e.getFormConfigurations());
        await Promise.allSettled(promises);
    }

    protected registerAuthenticationModule(fastify: FastifyInstance): void {
        registerAuthenticationModule(fastify);
    }

    protected registerStatic(fastify: FastifyInstance): void {
        const fastifyStatic = require('@fastify/static');
        fastify.register(fastifyStatic, {
            root: path.join(__dirname, '../../../../static/'),
            prefix: '/static/'
        });

        const fileDownloadPath = FileService.getDownloadDirectory();
        fastify.register(fastifyStatic, {
            root: fileDownloadPath,
            prefix: '/files/',
            decorateReply: false
        });
    }

    protected registerRoutes(fastify: FastifyInstance): void {
        super.registerRoutes(fastify);

        const applicationRoutes = [
            require('./routes/AuthenticationRouter'),
            require('./routes/ApplicationRouter'),
            require('./routes/ObjectIconRouter'),
            require('./routes/OAuth2RedirectRouter'),
        ];
        applicationRoutes.forEach((r) => fastify.register(r));
    }

    public getPort(): number {
        const port = ConfigurationService.getEnvNumber('HTTP_PORT') || 3000;
        return port;
    }

}
