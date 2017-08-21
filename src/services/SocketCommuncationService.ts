import { ICommunicator } from './../communicators/ICommunicator';
import { IConfigurationService } from './IConfigurationService';
import { inject, injectable, Container } from 'inversify';
import { ISocketCommunicationService } from './ISocketCommunicationService';
import { container } from '../Container';
import * as express from 'express';

@injectable()
export class SocketCommunicationService implements ISocketCommunicationService {

    private socketIO: any;

    public constructor( @inject("IConfigurationService") configurationService: IConfigurationService) {
        const app = express();
        const server = require('http').createServer(app);
        this.socketIO = require('socket.io')(server);

        const port = configurationService.getServerConfiguration().SOCKET_COMMUNICATION_PORT;

        server.listen(port, () => {
            // TODO: Use LoggingService
            console.log('Socket Communication Service listening on *:' + port);
        });

        this.registerListener();
    }

    private registerListener(): void {
        const communicators = container.getAll<ICommunicator>("Communicator");
        for (const communicator of communicators) {
            communicator.registerNamespace(this.socketIO);
        }
    }
}
