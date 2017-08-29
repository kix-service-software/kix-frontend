// tslint:disable
import { container } from "./../../src/Container";
import { AuthenticationCommunicator } from './../../src/communicators/';
import { IAuthenticationService, IConfigurationService, ISocketCommunicationService } from './../../src/services/';

import { HttpError } from './../../src/model/http/HttpError';
import { UserType, AuthenticationEvent, LoginRequest, AuthenticationResult } from './../../src/model-client/authentication';
import MockAdapter = require('axios-mock-adapter');

import express = require('express');

import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

import https = require('https');
import fs = require('fs');
import path = require('path');

chai.use(chaiAsPromised);
const expect = chai.expect;

const axios = require('axios');

describe('Authentication Communicator', () => {
    let mock;
    let configurationService: IConfigurationService;
    let socketCommunicationService: ISocketCommunicationService;
    let apiURL: string;

    before(async () => {
        await container.initialize();

        mock = new MockAdapter(axios);
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
    });

    after(() => {
        mock.restore();
        socketCommunicationService.stopServer();
    });

    // describe('Emit a valid login event', () => {
    //     before(() => {
    //         mock.onPost(apiURL + '/sessions', {
    //             UserLogin: 'agent',
    //             Password: 'agent',
    //             UserType: UserType.AGENT
    //         }).reply(200, { Token: 'ABCDEFG12345' });
    //     });

    //     after(() => {
    //         mock.reset();
    //     });

    //     it('Should retrieve a authorized event', async () => {
    //         const config = configurationService.getServerConfiguration();
    //         const socketUrl = "https://localhost:" + config.HTTPS_PORT;
    //         const socketIO = require('socket.io-client');
    //         const socket = socketIO.connect(socketUrl);

    //         socket.on('connect', (clientSocket) => {
    //             clientSocket.emit(AuthenticationEvent.LOGIN, new LoginRequest('agent', 'agent', UserType.AGENT));

    //             clientSocket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
    //                 expect(result).not.undefined;
    //                 expect(result).instanceof(AuthenticationResult);
    //                 expect(result.token).equals('ABCDEFG12345');
    //             });

    //             clientSocket.on(AuthenticationEvent.UNAUTHORIZED, (error) => {
    //                 expect(true, 'Should not throw an unauthorized event!').false;
    //             });
    //         });

    //         socket.on('connect_error', (error) => {
    //             expect(true, 'Could not connect to Server!').false;
    //         });

    //         socket.on('connect_timeout', () => {
    //             expect(true, 'Connection Timeout!').false;
    //         });
    //     });
    // });

    // describe('Emit an invalid login event', () => {
    //     before(() => {
    //         mock.onPost(apiURL + '/sessions', {
    //             UserLogin: 'agent',
    //             Password: 'agent',
    //             UserType: UserType.AGENT
    //         }).reply(400);
    //     });

    //     after(() => {
    //         mock.reset();
    //     });

    //     it('Should retrieve a unauthorized event', async () => {
    //         const config = configurationService.getServerConfiguration();
    //         const socketUrl = "https://localhost:" + config.HTTPS_PORT;
    //         const socketIO = require('socket.io-client');
    //         const socket = socketIO.connect(socketUrl);

    //         socket.on('connect', (clientSocket) => {
    //             clientSocket.emit(AuthenticationEvent.LOGIN, new LoginRequest('agent', 'agent', UserType.AGENT));

    //             clientSocket.on(AuthenticationEvent.AUTHORIZED, (result: AuthenticationResult) => {
    //                 expect(true, 'Should not throw an authorized event!').false;
    //             });

    //             clientSocket.on(AuthenticationEvent.UNAUTHORIZED, (error: HttpError) => {
    //                 expect(error).not.undefined;
    //                 expect(error).instanceof(HttpError);
    //             });
    //         });

    //         socket.on('connect_error', (error) => {
    //             expect(true, 'Could not connect to Server!').false;
    //         });

    //         socket.on('connect_timeout', () => {
    //             expect(true, 'Connection Timeout!').false;
    //         });
    //     });
    // });
});
