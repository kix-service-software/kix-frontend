import { inject, injectable } from 'inversify';
import { ServerRouter } from './ServerRouter';
import * as bodyParser from 'body-parser';
import * as path from 'path';

import { Environment, IServerConfiguration, } from '@kix/core/dist/common';

import {
    IMarkoService,
    ILoggingService,
    IConfigurationService,
    ISocketCommunicationService,
    IPluginService,
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

@injectable()
export class Server {

    public application: express.Application;
    private router: ServerRouter;
    private serverConfig: IServerConfiguration;
    private loggingService: ILoggingService;
    private configurationService: IConfigurationService;
    private socketCommunicationService: ISocketCommunicationService;
    private pluginService: IPluginService;

    public constructor(
        @inject("ILoggingService") loggingService: ILoggingService,
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("IPluginService") pluginService: IPluginService,
        @inject("ISocketCommunicationService") socketService: ISocketCommunicationService,
        @inject("IMarkoService") markoService: IMarkoService
    ) {
        this.loggingService = loggingService;
        this.configurationService = configurationService;
        this.pluginService = pluginService;
        this.socketCommunicationService = socketService;

        this.serverConfig = this.configurationService.getServerConfiguration();
        this.initializeApplication();
        this.initHttpServer();
    }

    private initializeApplication(): void {
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

        this.registerStaticContent();

        this.router = new ServerRouter(this.application);
    }

    private initHttpServer(): void {
        const httpPort = this.serverConfig.HTTP_PORT || 3000;
        http.createServer(this.application).listen(httpPort);

        const options = {
            key: fs.readFileSync(path.join(__dirname, '../cert/key.pem')),
            cert: fs.readFileSync(path.join(__dirname, '../cert/cert.pem')),
            passphrase: 'kix2018'
        };
        const server = https.createServer(options, this.application);
        this.socketCommunicationService.initialize(server);

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
