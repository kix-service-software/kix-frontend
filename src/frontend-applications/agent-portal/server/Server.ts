/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import * as bodyParser from 'body-parser';
import * as path from 'path';

import nodeRequire = require('marko/node-require');
nodeRequire.install(); // Allow Node.js to require and load `.marko` files

import markoExpress = require('marko/express');
import compression = require('compression');

import lassoMiddleware = require('lasso/middleware');

import express = require('express');
import cookieParser = require('cookie-parser');
import fs = require('fs');
import http = require('http');
import https = require('https');
import forceSSl = require('express-force-ssl');
import { LoggingService } from '../../../server/services/LoggingService';
import { IServerConfiguration } from '../../../server/model/IServerConfiguration';
import { ConfigurationService } from '../../../server/services/ConfigurationService';
import { CreateClientRegistration } from './model/CreateClientRegistration';
import { MarkoService } from './services/MarkoService';
import { ServerRouter } from './routes/ServerRouter';
import { AuthenticationService } from './services/AuthenticationService';
import { PluginService } from '../../../server/services/PluginService';
import { AgentPortalExtensions } from './extensions/AgentPortalExtensions';
import { IConfigurationExtension } from './extensions/IConfigurationExtension';
import { IConfiguration } from '../model/configuration/IConfiguration';
import { Error } from '../../../server/model/Error';
import { SysConfigOptionDefinition } from '../modules/sysconfig/model/SysConfigOptionDefinition';
import { ClientRegistrationService } from './services/ClientRegistrationService';
import { IServer } from '../../../server/model/IServer';
import { SocketService } from './services/SocketService';
import { IServiceExtension } from './extensions/IServiceExtension';
import { TranslationAPIService } from '../modules/translation/server/TranslationService';
import { SysConfigAccessLevel } from '../modules/sysconfig/model/SysConfigAccessLevel';

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
        ConfigurationService.getInstance().init(configDir, certDir);

        const serviceExtensions = await PluginService.getInstance().getExtensions<IServiceExtension>(
            AgentPortalExtensions.SERVICES
        );
        LoggingService.getInstance().info(`Initialize ${serviceExtensions.length} service extensions`);
        for (const extension of serviceExtensions) {
            await extension.initServices();
        }

        this.serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        await this.initializeApplication();
    }

    private async initializeApplication(): Promise<void> {
        await MarkoService.getInstance().initializeMarkoApplications();

        this.application = express();

        this.application.use(compression());
        this.application.use(bodyParser.json({ limit: '50mb', extended: true }));
        this.application.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        this.application.use(cookieParser());

        const httpsPort = this.serverConfig.HTTPS_PORT || 3001;

        if (this.serverConfig.USE_SSL) {
            this.application.set('forceSSLOptions', {
                httpsPort,
                sslRequiredMessage: 'SSL Required.'
            });
            this.application.use(forceSSl);
        }

        await this.registerStaticContent();
        await this.createClientRegistration();

        const router = new ServerRouter(this.application);
        await router.initializeRoutes();

        this.initHttpServer();
    }

    private async createClientRegistration(): Promise<void> {
        let poDefinitions = [];

        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

        const updateTranslations = serverConfig.UPDATE_TRANSLATIONS;
        if (updateTranslations) {
            LoggingService.getInstance().info('Update translations');
            poDefinitions = await TranslationAPIService.getInstance().getPODefinitions();
        }

        const configurations = await this.createDefaultConfigurations();
        const createClientRegistration = new CreateClientRegistration(
            this.serverConfig.NOTIFICATION_CLIENT_ID,
            this.serverConfig.NOTIFICATION_URL,
            this.serverConfig.NOTIFICATION_INTERVAL,
            'Token ' + AuthenticationService.getInstance().getCallbackToken(),
            poDefinitions, configurations
        );

        await ClientRegistrationService.getInstance().createClientRegistration(
            this.serverConfig.BACKEND_API_TOKEN, null, createClientRegistration
        ).catch((error) => {
            LoggingService.getInstance().error(error);
        });
    }

    public async initHttpServer(): Promise<void> {
        const httpPort = this.serverConfig.HTTP_PORT || 3000;
        const httpServer = http.createServer(this.application).listen(httpPort, () => {
            LoggingService.getInstance().info("KIX (HTTP) running on *:" + httpPort);
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
                LoggingService.getInstance().info("KIX (HTTPS) running on *:" + httpsPort);
            });
        } else {
            await SocketService.getInstance().initialize(httpServer);
        }
    }

    private async registerStaticContent(): Promise<void> {
        this.application.use(markoExpress());
        this.application.use(lassoMiddleware.serveStatic());

        this.application.use(express.static('../static/'));
    }

    private async createDefaultConfigurations(): Promise<SysConfigOptionDefinition[]> {
        LoggingService.getInstance().info('Create Default Configurations');
        const extensions = await PluginService.getInstance().getExtensions<IConfigurationExtension>(
            AgentPortalExtensions.CONFIGURATION
        ).catch((): IConfigurationExtension[] => []);

        if (extensions) {
            LoggingService.getInstance().info(`Found ${extensions.length} configuration extensions`);

            let configurations: IConfiguration[] = [];
            for (const extension of extensions) {
                let formConfigurations = await extension.getFormConfigurations().catch(
                    (error: Error): IConfiguration[] => {
                        LoggingService.getInstance().error(error.Message);
                        return [];
                    }
                );
                let defaultConfigurations = await extension.getDefaultConfiguration().catch(
                    (error: Error): IConfiguration[] => {
                        LoggingService.getInstance().error(error.Message);
                        return [];
                    }
                );

                formConfigurations = formConfigurations || [];
                defaultConfigurations = defaultConfigurations || [];

                configurations = [
                    ...configurations,
                    ...formConfigurations,
                    ...defaultConfigurations
                ];
            }

            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

            // await ModuleConfigurationService.getInstance().cleanUp(serverConfig.BACKEND_API_TOKEN);

            const sysconfigOptionDefinitions = configurations.map((c) => {
                const name = c.name ? c.name : c.id;
                const definition = new SysConfigOptionDefinition();
                definition.AccessLevel = SysConfigAccessLevel.INTERNAL;
                definition.Name = c.id;
                definition.Description = name;
                definition.Default = JSON.stringify(c);
                definition.Context = serverConfig.NOTIFICATION_CLIENT_ID;
                definition.ContextMetadata = c.type;
                definition.Type = 'String';
                definition.IsRequired = 0;
                return definition;
            });

            return sysconfigOptionDefinitions;
        }
    }
}
