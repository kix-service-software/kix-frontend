import { container } from './Container';
import { IConfigurationService, IPluginService } from './services/';
import { ServerRouter } from './ServerRouter';
import { container } from './Container';
import { IAuthenticationRouter } from './routes/IAuthenticationRouter';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import { IServerConfiguration } from './model/configuration/IServerConfiguration';
import { MockHTTPServer } from './mock-http/MockHTTPServer';
import { Environment } from './model';
<<<<<<< HEAD
import { ILoggingService } from './services';
=======
import { KIXExtensions, IStaticContentExtension } from './extensions';
>>>>>>> rel-18_FEATURE

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

    private configurationService: IConfigurationService;

    private pluginService: IPluginService;

    public constructor() {
        this.loggingService = container.get<ILoggingService>("ILoggingService");
        this.configurationService = container.get<IConfigurationService>("IConfigurationService");
        this.pluginService = container.get<IPluginService>("IPluginService");

        this.serverConfig = this.configurationService.getServerConfiguration();
        this.initializeApplication();

        // Start a Mock HTTP-Server for development, TODO: Should be removed if a test instance is available
        // TODO: Remove Mock HTTP Server
        if (this.configurationService.isDevelopmentMode()) {
            const mockServer = new MockHTTPServer();
        }
    }

    private initializeApplication(): void {
        lasso.configure(this.configurationService.getLassoConfiguration());

        this.application = express();
        this.application.use(compression());
        this.application.use(bodyParser.json());
        this.application.use(bodyParser.urlencoded({ extended: true }));

        this.application.use(markoExpress());

        this.registerStaticContent();

        this.router = new ServerRouter(this.application);

        const port = process.env.PORT || this.serverConfig.SERVER_PORT || 3000;
        this.application.listen(port);

        // TODO: Use LoggingService
        console.log("KIXng running on http://<host>:" + port);
        this.loggingService.info("LogService: KIXng running on http://<host>:" + port);
        this.loggingService.error("LogService: generic error message");
        this.loggingService.debug("LogService: generic debug message", { bla: 'bla', blub: 'blub'});
        this.loggingService.warning("LogService: generic warning message", { warn1: 'bla', warn2: 'blub'});
        this.loggingService.log('error', "LogService: generic log message with level 'error'", { test: 'test' });
        this.loggingService.log('warning', "LogService: generic log message with level 'warning'");
        // throw Error('Boom!');

    }

    private async registerStaticContent(): Promise<void> {
        this.application.use(lassoMiddleware.serveStatic());
        this.application.use(express.static('dist/static/'));

        const extensions = await this.pluginService
            .getExtensions<IStaticContentExtension>(KIXExtensions.STATIC_CONTENT);
        for (const staticContent of extensions) {
            this.application.use(staticContent.getName(), express.static('node_modules/' + staticContent.getPath()));
        }
    }
}

export default new Server();
