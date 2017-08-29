// tslint:disable
import { container } from './../../src/Container';

import { IConfigurationService, ISocketCommunicationService } from './../../src/services/';
import { IServerConfiguration, Environment } from './../../src/model/';

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Communication Service', () => {
    let configurationService: IConfigurationService;
    let socketCommunicationService: ISocketCommunicationService;

    before(() => {
        configurationService =
            container.getDIContainer().get<IConfigurationService>("IConfigurationService");

        socketCommunicationService =
            container.getDIContainer().get<ISocketCommunicationService>("ISocketCommunicationService");
    });

    after(() => {
        socketCommunicationService.stopServer();
    });

    describe('Socket IO Server', () => {
        it('Should be able to connect to socket server', async () => {
            const socketUrl = configurationService.getServerConfiguration().FRONTEND_SOCKET_URL;
            const socketIO = require('socket.io-client');
            const socket = socketIO.connect(socketUrl);

            socket.on('connect', (client) => {
                expect(true);
            });

            socket.on('connect_error', (error) => {
                expect(true).false;
            });

            socket.on('connect_timeout', () => {
                expect(true, 'Connection Timeout!').false;
            });
        });
    });
});
