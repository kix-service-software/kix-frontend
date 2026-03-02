/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from '../../../server/services/ConfigurationService';
import { LoggingService } from '../../../server/services/LoggingService';
import { SysConfigService } from '../modules/sysconfig/server/SysConfigService';
import { MainMenuService } from './services/MainMenuService';
import Fastify, { FastifyInstance } from 'fastify';
import markoPlugin from '@marko/fastify';
import path from 'path';
import { CacheService } from './services/cache';
import { APIUtil } from './api/APIUtil';
import { PluginService } from '../../../server/services/PluginService';
import { AgentPortalExtensions } from './extensions/AgentPortalExtensions';
import { IConfigurationExtension } from './extensions/IConfigurationExtension';
import { registerAuthenticationModule } from './routes/FastifyAuthentication';
import { IAgentPortalPlugin } from './model/IAgentPortalPlugin';
import { ConfigurationCache } from './api/context/ConfigurationCache';
import { ConfigurationBuilder } from './api/config/ConfigurationBuilder';
import { IMarkoApplication } from './extensions/IMarkoApplication';
import { FileService } from '../modules/file/server/FileService';

require('@marko/compiler/register')({ meta: true });

export class Server {

    private static INSTANCE: Server;

    public static getInstance(): Server {
        if (!Server.INSTANCE) {
            Server.INSTANCE = new Server();
        }
        return Server.INSTANCE;
    }

    private constructor() { }

    public name = 'AgentPortal';

    private fastify: FastifyInstance;

    public async initialize(): Promise<void> {
        await this.registerForms();
        MainMenuService.createDefaultConfiguration(ConfigurationService.getBackendAPIToken());
        SysConfigService.getInstance().preloadOptions();

        await this.initCacheDependencies();
        await ConfigurationBuilder.rebuildConfigCache().catch(() => null);
        await ConfigurationCache.getInstance().rebuildConfigCache().catch(() => null);

        await this.createHTTPServer();
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

    private async createHTTPServer(): Promise<any> {
        this.fastify = await this.setupFastify();

        await this.initPluginExtensions();

        this.fastify.listen({ port: this.getPort(), host: '0.0.0.0' }, (err, address) => {
            if (err) {
                this.fastify.log.error(err);
                process.exit(1);
            }
            LoggingService.getInstance().info(`[SERVER] start - running on port: ${this.getPort()}`);
        });
    }

    private async initPluginExtensions(): Promise<void> {
        const extensions = await PluginService.getInstance().getExtensions<IAgentPortalPlugin>(
            AgentPortalExtensions.PLUGIN
        ).catch((): IAgentPortalPlugin[] => []);

        for (const e of extensions) {
            await e.init(this);
        }
    }

    public async setupFastify(): Promise<FastifyInstance> {
        const fastifyLogLevelMap = { // without 'fatal' and 'trace'
            0: 'error', // 50 in log
            1: 'warn',  // 40
            2: 'info',  // 30
            3: 'debug'  // 20
        };

        // set to default 1MB
        const maxParamLength = ConfigurationService.getEnvNumber('AP_API_MAX_PARAM_LENGTH', 1000000);

        // set to default 50MB like in the BE API
        const bodyLimit = ConfigurationService.getEnvNumber('AP_API_MAX_BODY_LENGTH', 52428800);

        LoggingService.getInstance().info(`[SERVER] setting up server with maxParamLength ${maxParamLength} and maxBodyLength ${bodyLimit}`);

        const logLevelEnv = ConfigurationService.getEnvNumber('HTTP_LOG_LEVEL');
        const logOptions = {
            level: fastifyLogLevelMap[logLevelEnv] || 'error'
        };

        const fastify = Fastify({
            logger: logLevelEnv === -1 ? false : logOptions,
            maxParamLength,
            bodyLimit
        });

        fastify.addHook('onRoute', (routeOption) => {
            LoggingService.getInstance().info(`[SERVER] Route added - ${routeOption.method} ${routeOption.url}`);
        });

        fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
            try {
                const json = JSON.parse(body?.toString());
                done(null, json);
            } catch (err) {
                err.statusCode = 400;
                done(err, undefined);
            }
        });

        registerAuthenticationModule(fastify);
        this.registerStatic(fastify);
        this.registerRoutes(fastify);

        await this.registerPlugins(fastify);
        return fastify;
    }

    private registerStatic(fastify: FastifyInstance): void {
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

    private registerRoutes(fastify: FastifyInstance): void {
        const applicationRoutes = [
            require('./routes/AuthenticationRouter'),
            require('./routes/ApplicationRouter'),
            require('./routes/ObjectIconRouter'),
        ];
        applicationRoutes.forEach((r) => fastify.register(r));

        const apiRoutes = APIUtil.getRoutes();
        apiRoutes.forEach((r) => fastify.register(r, { prefix: `${APIUtil.URL_PREFIX}` }));
    }

    public registerPlugin(plugin: any, options: any = {}): void {
        options.prefix = `${APIUtil.URL_PREFIX}`;
        this.fastify.register(plugin, options);
    }

    private async registerPlugins(fastify: FastifyInstance): Promise<void> {
        fastify.register(markoPlugin);
    }

    public getPort(): number {
        const port = ConfigurationService.getEnvNumber('HTTP_PORT') || 3000;
        return port;
    }

}
