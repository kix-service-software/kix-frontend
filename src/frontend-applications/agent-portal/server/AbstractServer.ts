/**
 * Copyright (C) 2006-2026 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from '../../../server/services/ConfigurationService';
import { LoggingService } from '../../../server/services/LoggingService';
import Fastify, { FastifyInstance } from 'fastify';
import markoPlugin from '@marko/fastify';
import { APIUtil } from './api/APIUtil';
import { PluginService } from '../../../server/services/PluginService';
import { AgentPortalExtensions } from './extensions/AgentPortalExtensions';
import { IAgentPortalPlugin } from './model/IAgentPortalPlugin';
import { IServer } from './IServer';

require('@marko/compiler/register')({ meta: true });

export abstract class AbstractServer implements IServer {

    public abstract readonly name: string;
    public abstract readonly serverPrefix: string;

    private fastify: FastifyInstance;

    public async initialize(): Promise<void> {
        await this.preInitialize();

        await this.createHTTPServer();
    }

    protected abstract preInitialize(): Promise<void>;

    private async createHTTPServer(): Promise<any> {
        this.fastify = await this.setupFastify();

        await this.initPluginExtensions();

        this.fastify.listen({ port: this.getPort(), host: '0.0.0.0' }, (err, address) => {
            if (err) {
                this.fastify.log.error(err);
                process.exit(1);
            }
            LoggingService.getInstance().info(`[${this.serverPrefix}-SERVER] start - running on port: ${this.getPort()}`);
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
        const maxParamLength = ConfigurationService.getEnvNumber(`${this.serverPrefix}_API_MAX_PARAM_LENGTH`, 1000000);

        // set to default 50MB like in the BE API
        const bodyLimit = ConfigurationService.getEnvNumber(`${this.serverPrefix}_API_MAX_BODY_LENGTH`, 52428800);

        LoggingService.getInstance().info(`[${this.serverPrefix}-SERVER] setting up server with maxParamLength ${maxParamLength} and maxBodyLength ${bodyLimit}`);

        const logLevelEnv = ConfigurationService.getEnvNumber('HTTP_LOG_LEVEL');
        const logOptions = {
            level: fastifyLogLevelMap[logLevelEnv] || 'error'
        };

        const fastify = Fastify({
            logger: logLevelEnv === -1 ? false : logOptions,
            maxParamLength,
            bodyLimit
        });

        fastify.register(require('@fastify/accepts'));

        fastify.addHook('onRoute', (routeOption) => {
            LoggingService.getInstance().info(`[${this.serverPrefix}-SERVER] Route added - ${routeOption.method} ${routeOption.url}`);
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

        fastify.setErrorHandler((error: any, req, reply) => {
            if (error.name === 'SocketAuthenticationError') {
                reply
                    .status(401)
                    .type('application/json')
                    .send({
                        Code: 401,
                        Message: error.message
                    });
            } else {
                reply
                    .code(error.statusCode || error.StatusCode || 400)
                    .type('application/json')
                    .send(error);
            }
        });

        this.registerAuthenticationModule(fastify);
        this.registerStatic(fastify);
        this.registerRoutes(fastify);

        await this.registerPlugins(fastify);
        return fastify;
    }

    protected abstract registerAuthenticationModule(fastify: FastifyInstance): void;

    protected abstract registerStatic(fastify: FastifyInstance): void;

    protected registerRoutes(fastify: FastifyInstance): void {
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

    public abstract getPort(): number;

}
