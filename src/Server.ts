import { ServerRouter } from './ServerRouter';
import * as bodyParser from 'body-parser';
import * as path from 'path';

import { IServerConfiguration } from './core/common';

import { KIXExtensions, IStaticContentExtension } from './core/extensions';

import nodeRequire = require('marko/node-require');
nodeRequire.install(); // Allow Node.js to require and load `.marko` files

import markoExpress = require('marko/express');
import compression = require('compression');

import lassoMiddleware = require('lasso/middleware');
import lasso = require('lasso');

import express = require('express');
import cookieParser = require('cookie-parser');
import fs = require('fs');
import http = require('http');
import https = require('https');
import forceSSl = require('express-force-ssl');
import { ReleaseInfoUtil } from './ReleaseInfoUtil';
import { CreateClientRegistration } from './core/api';
import {
    ConfigurationService, LoggingService, ClientRegistrationService, TranslationService, AuthenticationService
} from './core/services';
import { PluginService, MarkoService, SocketService } from './services';
import { SystemInfo } from './core/model';

export class Server {

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
        this.serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        await this.initializeApplication();
    }

    private async initializeApplication(): Promise<void> {
        lasso.configure(ConfigurationService.getInstance().getLassoConfiguration());
        await MarkoService.getInstance().registerMarkoDependencies();

        this.application = express();

        this.application.use(compression());
        this.application.use(bodyParser.json());
        this.application.use(bodyParser.urlencoded({ extended: true }));
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
        const systemInfo = await this.createClientRegistration();
        await this.createReleaseInformation(systemInfo);

        // tslint:disable-next-line:no-unused-expression
        new ServerRouter(this.application);
    }

    private async createClientRegistration(): Promise<SystemInfo> {
        let poDefinitions = [];

        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

        const updateTranslations = serverConfig.UPDATE_TRANSLATIONS;
        if (updateTranslations) {
            LoggingService.getInstance().info('Update translations ...');
            poDefinitions = await TranslationService.getInstance().getPODefinitions();
        }

        const createClientRegistration = new CreateClientRegistration(
            'kix18-web-frontend', this.serverConfig.NOTIFICATION_URL, this.serverConfig.NOTIFICATION_INTERVAL,
            'Token ' + AuthenticationService.getInstance().getCallbackToken(),
            poDefinitions
        );

        const systemInfo = await ClientRegistrationService.getInstance().createClientRegistration(
            this.serverConfig.BACKEND_API_TOKEN, null, createClientRegistration
        ).catch((error) => {
            LoggingService.getInstance().error(error);
            return null;
        });

        return systemInfo;
    }

    private async createReleaseInformation(systemInfo: SystemInfo): Promise<void> {
        const releaseInfo = await ReleaseInfoUtil.getReleaseInfo();
        releaseInfo.backendSystemInfo = systemInfo;
        ConfigurationService.getInstance().saveModuleConfiguration('release-info', null, releaseInfo);
    }

    public async initHttpServer(): Promise<void> {
        const httpPort = this.serverConfig.HTTP_PORT || 3000;
        const httpServer = http.createServer(this.application).listen(httpPort, () => {
            LoggingService.getInstance().info("KIX (HTTP) running on *:" + httpPort);
        });

        if (this.serverConfig.USE_SSL) {
            const options = {
                key: fs.readFileSync(path.join(__dirname, '../cert/key.pem')),
                cert: fs.readFileSync(path.join(__dirname, '../cert/cert.pem')),
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
        this.application.use(express.static('dist/static/'));

        const extensions = await PluginService.getInstance()
            .getExtensions<IStaticContentExtension>(KIXExtensions.STATIC_CONTENT);
        for (const staticContent of extensions) {
            this.application.use(
                staticContent.getName(),
                express.static(path.join('node_modules', staticContent.getPath())
                ));
        }
    }
}
