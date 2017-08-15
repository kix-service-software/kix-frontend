import { AuthenticationService } from './services/AuthenticationService';
import { IAuthenticationService } from './services/IAuthenticationService';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import { ApplicationRouter } from './routes/ApplicationRouter';
import {
    HttpService,
    IHttpService,
    IMarkoService,
    IPluginService,
    MarkoService,
    PluginService
} from './services/';
import { IServerConfiguration } from './model/configuration/IServerConfiguration';
import { MockHTTPServer } from './mock-http/MockHTTPServer';

import nodeRequire = require('marko/node-require');
nodeRequire.install(); // Allow Node.js to require and load `.marko` files

import markoExpress = require('marko/express');
import compression = require('compression');
import lassoMiddleware = require('lasso/middleware');

import lasso = require('lasso');

lasso.configure({
    bundlingEnabled: false,
    fingerprintsEnabled: false,
    includeSlotNames: false,
    minify: false,
    plugins: [
        'lasso-marko',
        'lasso-less'
    ],
    outputDir: "dist/static"
});

export class Server {

    public application: express.Application;

    private router: express.Router;

    private serverConfig: IServerConfiguration;

    private pluginService: IPluginService;

    private httpService: IHttpService;

    private authenticationService: IAuthenticationService;

    private markoService: IMarkoService;

    public constructor() {
        this.initializeServer();
    }

    private async initializeServer(): Promise<void> {
        await this.initializeServices();
        this.application = express();
        this.serverConfig = require('../server.config.json');
        this.initializeApplication();
        this.initializeRoutes();
    }

    private async initializeServices(): Promise<void> {
        this.pluginService = new PluginService();
        this.httpService = new HttpService();
        this.authenticationService = new AuthenticationService(this.httpService);
        this.markoService = new MarkoService(this.pluginService);

        await this.markoService.registerMarkoDependencies();

        // TODO: Logging-Service initialize
    }

    private initializeApplication(): void {
        this.application.use(compression());
        this.application.use(bodyParser.json());
        this.application.use(bodyParser.urlencoded({ extended: true }));

        this.application.use(markoExpress());
        this.application.use(express.static('dist/static/'));
        // TODO: retrieve extensions for static content from plugins

        this.router = express.Router();
        this.application.use(this.router);

        const port = process.env.PORT || this.serverConfig.SERVER_PORT || 3000;
        this.application.listen(port);

        // TODO: Use LoggingService
        console.log("KIXng running on http://<host>:" + port);
    }

    private initializeRoutes(): void {
        this.router.use("/", new ApplicationRouter(this.authenticationService).router);
    }
}

// Start a Mock HTTP-Server for development, TODO: Should be removed if a test instance is available
if (process.env.NODE_ENV === 'development') {
    const mockServer = new MockHTTPServer();
}

export default new Server();
