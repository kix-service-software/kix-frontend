import { ServerRouter } from './ServerRouter';
import { container } from './Container';
import { IAuthenticationRouter } from './routes/IAuthenticationRouter';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import { IServerConfiguration } from './model/configuration/IServerConfiguration';
import { MockHTTPServer } from './mock-http/MockHTTPServer';
import { Environment } from './model';
import { ILoggingService } from './services';

import nodeRequire = require('marko/node-require');
nodeRequire.install(); // Allow Node.js to require and load `.marko` files

import markoExpress = require('marko/express');
import compression = require('compression');

import lassoMiddleware = require('lasso/middleware');
import lasso = require('lasso');

export class Server {

    public application: express.Application;

    private router: ServerRouter;

    private serverConfig: IServerConfiguration;

    private loggingService: ILoggingService;

    public constructor() {
        this.loggingService = container.get<ILoggingService>("ILoggingService");
        this.initializeApplication();
    }

    private initializeApplication(): void {
        // TODO: Use a [ConfigurationService] to retrieve the correct lasso configuration!
        if (this.isProductionMode()) {
            lasso.configure(require('../lasso.prod.config.json'));
        } else {
            lasso.configure(require('../lasso.dev.config.json'));
        }

        // TODO: Implement and use a [ConfigurationService]
        this.serverConfig = require('../server.config.json');

        this.application = express();
        this.application.use(compression());
        this.application.use(bodyParser.json());
        this.application.use(bodyParser.urlencoded({ extended: true }));

        this.application.use(markoExpress());
        this.application.use(lassoMiddleware.serveStatic());
        this.application.use(express.static('dist/static/'));
        // TODO: retrieve extensions for static content from plugins

        this.router = new ServerRouter(this.application);

        const port = process.env.PORT || this.serverConfig.SERVER_PORT || 3000;
        this.application.listen(port);

        // TODO: Use LoggingService
        console.log("KIXng running on http://<host>:" + port);
        this.loggingService.info("LogService: KIXng running on http://<host>:" + port);
        this.loggingService.error("LogService: generic error message");
        this.loggingService.debug("LogService: generic debug message", { bla: 'bla', blub: 'blub'});
        this.loggingService.warning("LogService: generic warning message", { warn1: 'bla', warn2: 'blub'});

    }

    // TODO: Use a [ConfigurationService] to retrieve the current environment
    private isProductionMode(): boolean {
        const environment = process.env.NODE_ENV.toLowerCase();
        return environment === Environment.PRODUCTION ||
            (environment !== Environment.DEVELOPMENT && environment !== Environment.TEST);
    }
}

// Start a Mock HTTP-Server for development, TODO: Should be removed if a test instance is available
// TODO: Remove MOck HTTP Server
if (process.env.NODE_ENV === Environment.DEVELOPMENT) {
    const mockServer = new MockHTTPServer();
}

export default new Server();
