import { inject, injectable } from 'inversify';
import { ServerRouter } from './ServerRouter';
import * as bodyParser from 'body-parser';
import * as path from 'path';

import { Environment, IServerConfiguration, ServiceContainer, IService, } from '@kix/core/dist/common';

import {
    IMarkoService,
    ILoggingService,
    IConfigurationService,
    ISocketCommunicationService,
    IPluginService,
    IClientRegistrationService,
} from '@kix/core/dist/services';

import { KIXExtensions, IStaticContentExtension } from '@kix/core/dist/extensions';

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
import forceSsl = require('express-force-ssl');
import { ReleaseInfoUtil } from './ReleaseInfoUtil';
import { CreateClientRegistration } from '@kix/core/dist/api';

@injectable()
export class Server {

    public application: express.Application;
    private router: ServerRouter;
    private serverConfig: IServerConfiguration;

    public constructor(
        @inject("ILoggingService") private loggingService: ILoggingService,
        @inject("IConfigurationService") private configurationService: IConfigurationService,
        @inject("IPluginService") private pluginService: IPluginService,
        @inject("IClientRegistrationService") private clientRegistrationService: IClientRegistrationService,
        @inject("ISocketCommunicationService") private socketService: ISocketCommunicationService,
        @inject("IMarkoService") private markoService: IMarkoService
    ) {
        this.serverConfig = this.configurationService.getServerConfiguration();
        this.initializeApplication();

    }

    private async initializeApplication(): Promise<void> {
        lasso.configure(this.configurationService.getLassoConfiguration());

        this.application = express();

        this.application.use(compression());
        this.application.use(bodyParser.json());
        this.application.use(bodyParser.urlencoded({ extended: true }));
        this.application.use(cookieParser());

        const httpsPort = this.serverConfig.HTTPS_PORT || 3001;

        this.application.set('forceSSLOptions', {
            httpsPort,
            sslRequiredMessage: 'SSL Required.'
        });
        this.application.use(forceSsl);

        await this.registerStaticContent();
        await this.createReleaseInfoConfig();
        await this.initHttpServer();

        this.router = new ServerRouter(this.application);
    }

    private async createReleaseInfoConfig(): Promise<void> {
        const releaseInfo = await ReleaseInfoUtil.getReleaseInfo();

        const createClientRegistration = new CreateClientRegistration(
            Date.now().toString(), this.serverConfig.FRONTEND_URL, '12345'
        );

        const systemInfo = await this.clientRegistrationService.createClientRegistration(
            this.serverConfig.BACKEND_API_TOKEN, createClientRegistration
        ).catch((error) => {
            this.loggingService.error(error);
            return null;
        });

        releaseInfo.backendSystemInfo = systemInfo;
        this.configurationService.saveModuleConfiguration('release-info', null, releaseInfo);
    }

    private async initHttpServer(): Promise<void> {
        await this.markoService.appIsReady();

        const httpPort = this.serverConfig.HTTP_PORT || 3000;
        http.createServer(this.application).listen(httpPort);

        const options = {
            key: fs.readFileSync(path.join(__dirname, '../cert/key.pem')),
            cert: fs.readFileSync(path.join(__dirname, '../cert/cert.pem')),
            passphrase: 'kix2018'
        };
        const server = https.createServer(options, this.application);
        this.socketService.initialize(server);

        const httpsPort = this.serverConfig.HTTPS_PORT || 3001;

        server.listen(httpsPort, () => {
            console.log("KIXng running on *:" + httpsPort);
            this.loggingService.info("KIXng running on *:" + httpsPort);
        });
    }

    private async registerStaticContent(): Promise<void> {
        this.application.use(markoExpress());
        this.application.use(lassoMiddleware.serveStatic());
        this.application.use(express.static('dist/static/'));

        const extensions = await this.pluginService
            .getExtensions<IStaticContentExtension>(KIXExtensions.STATIC_CONTENT);
        for (const staticContent of extensions) {
            this.application.use(
                staticContent.getName(),
                express.static(path.join('node_modules', staticContent.getPath())
                ));
        }
    }
}
