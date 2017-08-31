// tslint:disable
import { container } from "./../../src/Container";
import { AuthenticationCommunicator } from './../../src/communicators/';
import { IAuthenticationService, IConfigurationService, ISocketCommunicationService } from './../../src/services/';

import { HttpError } from './../../src/model/http/HttpError';
import { UserType, AuthenticationEvent, LoginRequest, AuthenticationResult } from './../../src/model-client/authentication';

import express = require('express');

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

import https = require('https');
import fs = require('fs');
import path = require('path');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Authentication Communicator', () => {
    let nockScope;
    let client;
    let configurationService: IConfigurationService;
    let socketCommunicationService: ISocketCommunicationService;
    let apiURL: string;
    let socketIO;
    let socketUrl;

    before(async () => {
        await container.initialize();

        const nock = require('nock');
        configurationService = container.getDIContainer().get<IConfigurationService>("IConfigurationService");
        socketCommunicationService = container.getDIContainer().get<ISocketCommunicationService>("ISocketCommunicationService");

        const app: express.Application = express();

        const options = {
            key: fs.readFileSync(path.join(__dirname, '../../cert/key.pem')),
            cert: fs.readFileSync(path.join(__dirname, '../../cert/cert.pem')),
            passphrase: 'kix2018'
        };

        const server = https.createServer(options, app);
        socketCommunicationService.initialize(server);

        const port = configurationService.getServerConfiguration().HTTPS_PORT;
        server.listen(port);

        apiURL = configurationService.getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);

        const config = configurationService.getServerConfiguration();
        socketUrl = "https://localhost:" + config.HTTPS_PORT;
        socketIO = require('socket.io-client');

    });

    after(() => {
        socketCommunicationService.stopServer();
    });

    describe('Emit a valid login event', () => {
        let socket;

        before(() => {
            nockScope
                .post('/sessions', {
                    UserLogin: 'agent',
                    Password: 'agent',
                    UserType: UserType.AGENT
                })
                .reply(200, { Token: 'ABCDEFG12345' });
            socket = socketIO.connect(socketUrl);
        });

        after(() => {
            socket.close();
        });

        it('Should retrieve a authorized event', async () => {

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

            socket.on('connect_error', (error) => {
                expect(true, 'Could not connect to Server!').false;
            });

            socket.on('connect_timeout', () => {
                expect(true, 'Connection Timeout!').false;
            });

        });
    });

    describe('Emit an invalid login event', () => {
        let socket;

        before(() => {
            nockScope
                .post('/sessions', {
                    UserLogin: 'agent',
                    Password: 'agent',
                    UserType: UserType.AGENT
                })
                .reply(400);
            socket = socketIO.connect(socketUrl);
        });

        after(() => {
            socket.close();
        });

        it('Should retrieve a unauthorized event', async () => {
            socket.on('connect', (clientSocket) => {
                client.emit(AuthenticationEvent.LOGIN, new LoginRequest('agent', 'agent', UserType.AGENT));

                client.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
                    expect(true, 'Should not throw an authorized event!').false;
                });

                client.on(AuthenticationEvent.UNAUTHORIZED, (error: HttpError) => {
                    expect(error).not.undefined;
                    expect(error).instanceof(HttpError);
                });
            });

            socket.on('connect_error', (error) => {
                expect(true, 'Could not connect to Server!').false;
            });

            socket.on('connect_timeout', () => {
                expect(true, 'Connection Timeout!').false;
            });

        });
    });
});
