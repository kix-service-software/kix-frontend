import { ILoggingService } from './ILoggingService';
import { ICommunicator } from './../communicators/ICommunicator';
import { IConfigurationService } from './IConfigurationService';
import { inject, injectable } from 'inversify';
import { ISocketCommunicationService } from './ISocketCommunicationService';
import { container } from '../Container';
import * as express from 'express';

@injectable()
export class SocketCommunicationService implements ISocketCommunicationService {

    private socketIO: SocketIO.Server;

    private loggingService: ILoggingService;

    public constructor(
        @inject("ILoggingService") loggingService: ILoggingService,
        @inject("IConfigurationService") configurationService: IConfigurationService) {

        this.loggingService = loggingService;

        const app = express();
        const server = require('http').createServer(app);
        this.socketIO = require('socket.io')(server);

        const port = configurationService.getServerConfiguration().SOCKET_COMMUNICATION_PORT;

        server.listen(port, () => {
            this.loggingService.info('Socket Communication Service listening on *:' + port);
        });

        this.registerListener();
    }

    public stopServer(): void {
        this.socketIO.close();
    }

    private registerListener(): void {
        const communicators = container.getAll<ICommunicator>("ICommunicator");
        for (const communicator of communicators) {
            communicator.registerNamespace(this.socketIO);
        }
    }
}
