import { ISocketCommunicationService, IConfigurationService, ILoggingService } from './';
import { ICommunicator } from './../communicators/ICommunicator';
import { inject, injectable } from 'inversify';
import { container } from '../Container';
import * as express from 'express';

import path = require('path');
import fs = require('fs');
import https = require('https');

@injectable()
export class SocketCommunicationService implements ISocketCommunicationService {

    private socketIO: SocketIO.Server;
    private loggingService: ILoggingService;
    private configurationService: IConfigurationService;

    public constructor(
        @inject("ILoggingService") loggingService: ILoggingService,
        @inject("IConfigurationService") configurationService: IConfigurationService
    ) {
        this.loggingService = loggingService;
        this.configurationService = configurationService;
    }

    public initialize(server: https.Server): void {
        this.socketIO = require('socket.io')(server);
        this.registerListener();
    }

    public stopServer(): void {
        this.socketIO.close();
    }

    private registerListener(): void {
        const communicators = container.getDIContainer().getAll<ICommunicator>("ICommunicator");
        for (const communicator of communicators) {
            communicator.registerNamespace(this.socketIO);
        }
    }
}
