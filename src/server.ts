import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import { IServerConfiguration } from './model/configuration/IServerConfiguration';

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

    public constructor() {
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
        this.application.use(express.static('dist/static/'));

        this.router = express.Router();
        this.application.use(this.router);

        const port = this.serverConfig.SERVER_PORT || process.env.PORT || 3000;
        this.application.listen(port);

        console.log("KIXng running on http://<host>:" + port);
    }

    private initializeRoutes(): void {
        this.router.get("/", (req: express.Request, res: express.Response) => {
            const template = require('./components/app/index.marko');
            res.marko(template, {});
        });
    }
}

export default new Server();