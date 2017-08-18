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

        this.application.use((req: express.Request, res: express.Response, next: () => void) => {
            res.header("Access-Control-Allow-Origin", "http://localhost:3123");
            res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept");
            res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
            res.header("Access-Control-Allow-Credentials", "true");
            next();
        });

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

        this.router.post('/sessions', (req: express.Request, res: express.Response) => {
            res.send({ token: 'ABCDEFG12345' });
        });
    }
}

export default MockHTTPServer;
