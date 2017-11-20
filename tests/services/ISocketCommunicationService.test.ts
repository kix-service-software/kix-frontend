// tslint:disable
import { container } from './../../src/Container';

import { IConfigurationService, ISocketCommunicationService } from '@kix/core/dist/services';
import { IServerConfiguration, Environment } from '@kix/core/dist/common';

import https = require('https');
import express = require('express');
import chaiAsPromised = require('chai-as-promised');
import chai = require('chai');

import fs = require('fs');
import path = require('path');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Communication Service', () => {
    let configurationService: IConfigurationService;
    let socketCommunicationService: ISocketCommunicationService;

    before(async () => {
        await container.initialize();

        configurationService =
            container.getDIContainer().get<IConfigurationService>("IConfigurationService");

        socketCommunicationService =
            container.getDIContainer().get<ISocketCommunicationService>("ISocketCommunicationService");

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
    });

    after(() => {
        socketCommunicationService.stopServer();
    });

    describe('Socket IO Server', () => {
        let socket;
        before(() => {
            const config = configurationService.getServerConfiguration();
            const socketUrl = "https://localhost:" + config.HTTPS_PORT;
            const socketIO = require('socket.io-client');
            socket = socketIO.connect(socketUrl);
        });

        after(() => {
            socket.close();
        })

        it('Should be able to connect to socket server', async () => {
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
