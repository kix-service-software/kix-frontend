import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import compression = require('compression');

export class MockHTTPServer {

    public application: express.Application;

    private router: express.Router;

    public constructor() {
        this.application = express();
        this.initializeApplication();
        this.initializeRoutes();
    }

    private initializeApplication(): void {
        this.application.use(compression());
        this.application.use(bodyParser.json());
        this.application.use(bodyParser.urlencoded({ extended: true }));

        this.router = express.Router();
        this.application.use(this.router);

        const port = 3123;
        this.application.listen(port);

        console.log("KIXng Mock Server running on http://<host>:" + port);
    }

    private initializeRoutes(): void {
        this.router.get("/", (req: express.Request, res: express.Response) => {
            res.send("Test");
        });
    }
}

export default MockHTTPServer;
