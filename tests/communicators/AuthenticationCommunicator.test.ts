// tslint:disable
import { Container } from 'inversify';

import { AuthenticationCommunicator } from './../../src/communicators/';
import { IAuthenticationService, IConfigurationService, ISocketCommunicationService } from './../../src/services/';

import { HttpError } from './../../src/model/http/HttpError';
import { UserType, AuthenticationEvent, LoginRequest, AuthenticationResult } from './../../src/model-client/';
import MockAdapter = require('axios-mock-adapter');

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

chai.use(chaiAsPromised);
const expect = chai.expect;

const axios = require('axios');

describe('Authentication Communicator', () => {
    let mock;
    let configurationService: IConfigurationService;
    let socketCommunicationService: ISocketCommunicationService;
    let apiURL: string;

    before(() => {
        mock = new MockAdapter(axios);
        const container: Container = require('./../../src/Container').container;
        configurationService = container.get<IConfigurationService>("IConfigurationService");
        socketCommunicationService = container.get<ISocketCommunicationService>("ISocketCommunicationService");

        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
    });

    after(() => {
        mock.restore();
        socketCommunicationService.stopServer();
    });

    describe('Emit a valid login event', () => {
        before(() => {
            mock.onPost(apiURL + '/sessions', {
                UserLogin: 'agent',
                Password: 'agent',
                UserType: UserType.AGENT
            }).reply(200, { Token: 'ABCDEFG12345' });
        });

        after(() => {
            mock.reset();
        });

        it('Should retrieve a authorized event', async () => {
            const socketPort = configurationService.getServerConfiguration().SOCKET_COMMUNICATION_PORT;
            const socketIO = require('socket.io-client');
            const socket = socketIO.connect('http://localhost:' + socketPort);

            socket.on('connect', (clientSocket) => {
                clientSocket.emit(AuthenticationEvent.LOGIN, new LoginRequest('agent', 'agent', UserType.AGENT));

                clientSocket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
                    expect(result).not.undefined;
                    expect(result).instanceof(AuthenticationResult);
                    expect(result.token).equals('ABCDEFG12345');
                });

                clientSocket.on(AuthenticationEvent.UNAUTHORIZED, (error) => {
                    expect(true, 'Should not throw an unauthorized event!').false;
                });
            });
        });
    });

    describe('Emit an invalid login event', () => {
        before(() => {
            mock.onPost(apiURL + '/sessions', {
                UserLogin: 'agent',
                Password: 'agent',
                UserType: UserType.AGENT
            }).reply(400);
        });

        after(() => {
            mock.reset();
        });

        it('Should retrieve a unauthorized event', async () => {
            const socketPort = configurationService.getServerConfiguration().SOCKET_COMMUNICATION_PORT;
            const socketIO = require('socket.io-client');
            const socket = socketIO.connect('http://localhost:' + socketPort);

            socket.on('connect', (clientSocket) => {
                clientSocket.emit(AuthenticationEvent.LOGIN, new LoginRequest('agent', 'agent', UserType.AGENT));

                clientSocket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
                    expect(true, 'Should not throw an authorized event!').false;
                });

                clientSocket.on(AuthenticationEvent.UNAUTHORIZED, (error: HttpError) => {
                    expect(error).not.undefined;
                    expect(error).instanceof(HttpError);
                });
            });
        });
    });
});
