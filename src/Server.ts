import { IAuthenticationRouter } from './routes/IAuthenticationRouter';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import { container } from './Container';
import { IApplicationRouter } from './routes/IApplicationRouter';
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
        "lasso-marko",
        "lasso-less"
    ],
    outputDir: "dist/static"
});

export class Server {

    public application: express.Application;

    private router: express.Router;

    private serverConfig: IServerConfiguration;

    public constructor() {
        this.initializeServer();
    }

    private initializeServer(): void {
        this.application = express();
        this.serverConfig = require('../server.config.json');
        this.initializeApplication();
        this.initializeRoutes();
    }

    private initializeApplication(): void {
        this.application.use(compression());
        this.application.use(bodyParser.json());
        this.application.use(bodyParser.urlencoded({ extended: true }));

        this.application.use(markoExpress());
        this.application.use(lassoMiddleware.serveStatic());
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
        const applicationRouter = container.get<IApplicationRouter>("IApplicationRouter");
        this.router.use("/", applicationRouter.router);

        const authenticationRouter = container.get<IAuthenticationRouter>("IAuthenticationRouter");
        this.router.use("/auth", authenticationRouter.router);
    }
}

// Start a Mock HTTP-Server for development, TODO: Should be removed if a test instance is available
if (process.env.NODE_ENV === 'development') {
    const mockServer = new MockHTTPServer();
}

export default new Server();
