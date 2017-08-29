import https = require('https');
import express from 'express';

export interface ISocketCommunicationService {

    stopServer(): void;

    initialize(application: https.Server): void;

}
