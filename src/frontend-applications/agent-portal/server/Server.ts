/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import path from 'path';

import express from 'express';

require('@marko/compiler/register')({ meta: true });
import markoExpress from '@marko/express';

import { serveStatic } from 'lasso/middleware';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import http from 'http';
import https from 'https';
import forceSSl from 'express-force-ssl';
import { LoggingService } from '../../../server/services/LoggingService';
import { IServerConfiguration } from '../../../server/model/IServerConfiguration';
import { ConfigurationService } from '../../../server/services/ConfigurationService';
import { MarkoService } from './services/MarkoService';
import { ServerRouter } from './routes/ServerRouter';
import { PluginService } from '../../../server/services/PluginService';
import { AgentPortalExtensions } from './extensions/AgentPortalExtensions';
import { IServer } from '../../../server/model/IServer';
import { SocketService } from './services/SocketService';
import { IServiceExtension } from './extensions/IServiceExtension';
import { IInitialDataExtension } from '../model/IInitialDataExtension';
import { MigrationService } from '../migrations/MigrationService';
import { AuthenticationService } from './services/AuthenticationService';
import { ClientRegistrationService } from './services/ClientRegistrationService';

export class Server implements IServer {

    private static INSTANCE: Server;

    public static getInstance(): Server {
        if (!Server.INSTANCE) {
            Server.INSTANCE = new Server();
        }
        return Server.INSTANCE;
    }

    public application: express.Application;
    private serverConfig: IServerConfiguration;

    public async initServer(): Promise<void> {
        const configDir = path.join(__dirname, '..', '..', '..', '..', 'config');
        const certDir = path.join(__dirname, '..', '..', '..', '..', 'cert');
        const dataDir = path.join(__dirname, '..', '..', '..', '..', 'data');
        ConfigurationService.getInstance().init(configDir, certDir, dataDir);

        const serviceExtensions = await PluginService.getInstance().getExtensions<IServiceExtension>(
            AgentPortalExtensions.SERVICES
        );

        process.on('unhandledRejection', (reason, promise) => {
            LoggingService.getInstance().error('An unhandledRejection occured:', reason);
            LoggingService.getInstance().error(reason.toString(), reason);
            console.error('Unhandled Rejection at: Promise', promise, 'reason:', reason);
            console.error(reason);
            // throw reason;
        });

        LoggingService.getInstance().info(`Initialize ${serviceExtensions.length} service extensions`);
        for (const extension of serviceExtensions) {
            await extension.initServices();
        }

        const success = await MigrationService.getInstance().startMigration();
        if (!success) {
            LoggingService.getInstance().error('Startup failed. Could not migrate!');
            process.exit(1);
        }

        const initialDataExtensions = await PluginService.getInstance().getExtensions<IInitialDataExtension>(
            AgentPortalExtensions.INITIAL_DATA
        );
        LoggingService.getInstance().info(`Create initial data (${initialDataExtensions.length} extensions)`);
        for (const extension of initialDataExtensions) {
            await extension.createData().catch((e) => {
                LoggingService.getInstance().error(`Error creating inital data: ${extension.name}.`, e);
            });
        }

        this.serverConfig = ConfigurationService.getInstance().getServerConfiguration();

        const backendToken = AuthenticationService.getInstance().getCallbackToken();
        const promises = [
            ClientRegistrationService.getInstance().createClientRegistration(backendToken),
            MarkoService.getInstance().initializeMarkoApplications()
        ];

        await Promise.all(promises).catch((error) => {
            LoggingService.getInstance().error(error);
            process.exit(99);
        });

        await this.initializeApplication();
    }

    private async initializeApplication(): Promise<void> {
        this.application = express();

        this.application.use(compression());
        this.application.use(express.json({ limit: '50mb' }));
        this.application.use(express.urlencoded({ limit: '50mb', extended: true }));
        this.application.use(cookieParser());

        const httpsPort = this.serverConfig.HTTPS_PORT || 3001;

        if (this.serverConfig.USE_SSL) {
            this.application.set('forceSSLOptions', {
                httpsPort,
                sslRequiredMessage: 'SSL Required.'
            });
            this.application.use(forceSSl);
        }

        this.application.use(markoExpress());
        this.application.use(serveStatic());
        this.application.use(express.static('../static/'));

        const router = new ServerRouter(this.application);
        await router.initializeRoutes();

        this.initHttpServer();
    }

    private async initHttpServer(): Promise<void> {
        const httpPort = this.serverConfig.HTTP_PORT || 3000;
        const httpServer = http.createServer(this.application).listen(httpPort, () => {
            LoggingService.getInstance().info('KIX (HTTP) running on *:' + httpPort);
        });

        if (this.serverConfig.USE_SSL) {
            const options = {
                key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
                cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
                passphrase: 'kix2018'
            };

            const httpsServer = https.createServer(options, this.application);

            const httpsPort = this.serverConfig.HTTPS_PORT || 3001;

            await SocketService.getInstance().initialize(httpsServer);

            httpsServer.listen(httpsPort, () => {
                LoggingService.getInstance().info('KIX (HTTPS) running on *:' + httpsPort);
            });
        } else {
            await SocketService.getInstance().initialize(httpServer);
        }
    }

}
