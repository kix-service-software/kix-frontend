/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

const http = require('http');
import express from 'express';
import markoExpress from '@marko/express';
import { serveStatic } from 'lasso/middleware';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { IServerConfiguration } from '../../../server/model/IServerConfiguration';
import { ConfigurationService } from '../../../server/services/ConfigurationService';
import { ServerRouter } from './routes/ServerRouter';
import { IServer } from '../../../server/model/IServer';
import { MainMenuNamespace } from '../modules/agent-portal/server/MainMenuNamespace';
import { SysConfigService } from '../modules/sysconfig/server/SysConfigService';
import { SocketService } from './services/SocketService';

require('@marko/compiler/register')({ meta: true });

export class Server implements IServer {

    public name = 'AgentPortal';

    public application: express.Application;
    private serverConfig: IServerConfiguration;
    private httpServer: any;
    private socketIO: any;
    private socketService: SocketService;

    public async initialize(): Promise<void> {
        this.serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const maxConfig = this.serverConfig?.SOCKET_MAX_HTTP_BUFFER_SIZE;
        const maxHttpBufferSize = maxConfig || 1e8;

        MainMenuNamespace.getInstance().createDefaultConfiguration(this.serverConfig.BACKEND_API_TOKEN);
        SysConfigService.getInstance().preloadOptions();
        await this.initializeApplication();

        this.createHTTPServer();
        this.socketIO = require('socket.io')(this.httpServer, {
            maxHttpBufferSize
        });
    }

    private createHTTPServer(ssl: boolean = true): any {
        const app = this.application || express();
        this.httpServer = http.createServer(app);
    }

    public async initializeApplication(): Promise<void> {
        this.application = express();

        this.application.use(compression());
        this.application.use(express.json({ limit: '50mb' }));
        this.application.use(express.urlencoded({ limit: '50mb', extended: true }));
        this.application.use(cookieParser());
        this.application.use(markoExpress());
        this.application.use(serveStatic());
        this.application.use(express.static('../static/'));

        const router = new ServerRouter(this.application);
        await router.initializeRoutes();
    }

    public getHttpServer(): any {
        return this.httpServer;
    }

    public getPort(): number {
        let port = 3001;
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        if (serverConfig.USE_SSL) {
            port = serverConfig.HTTPS_PORT || 3001;
        } else {
            port = serverConfig.HTTP_PORT || 3000;
        }

        return port;
    }

    public getSocketIO(): any {
        return this.socketIO;
    }

    public async initializeSocketIO(): Promise<void> {
        this.socketService = new SocketService(this.getSocketIO());
        await this.socketService.initialize();
    }

    public getSocketService(): SocketService {
        return this.socketService;
    }

}
