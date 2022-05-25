/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import cluster from 'node:cluster';
import { cpus } from 'node:os';
import express = require('express');

import { ConfigurationService } from './services/ConfigurationService';
import { PluginService } from './services/PluginService';
import { LoggingService } from './services/LoggingService';
import { Server } from '../frontend-applications/agent-portal/server/Server';
import { AgentPortalExtensions } from '../frontend-applications/agent-portal/server/extensions/AgentPortalExtensions';
import { MarkoService } from '../frontend-applications/agent-portal/server/services/MarkoService';
import { IInitialDataExtension } from '../frontend-applications/agent-portal/model/IInitialDataExtension';

import fs = require('fs');
import https = require('https');
import http = require('http');
import { SocketService } from '../frontend-applications/agent-portal/server/services/SocketService';
import { ClientRegistrationService } from '../frontend-applications/agent-portal/server/services/ClientRegistrationService';

const path = require('path');
const { setupMaster, setupWorker } = require('@socket.io/sticky');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');

const numCPUs = cpus().length;

process.setMaxListeners(0);

async function initializeServer(): Promise<void> {
    const configDir = path.join(__dirname, '..', '..', 'config');
    const certDir = path.join(__dirname, '..', '..', 'cert');
    const dataDir = path.join(__dirname, '..', '..', 'data');
    ConfigurationService.getInstance().init(configDir, certDir, dataDir);

    LoggingService.getInstance().info('[SERVER] Start');

    const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

    await initializeFrontend();

    if (serverConfig.CLUSTER_ENABLED) {
        if (cluster.isPrimary) {


            const httpServer = await startApplication();

            setupMaster(httpServer, {
                loadBalancingMethod: 'least-connection',
            });

            setupPrimary();
        } else {
            console.log(`Worker ${process.pid} started`);

            await startApplication(true);

            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }

            cluster.on('exit', (worker) => {
                console.log(`Worker ${worker.process.pid} died`);
                cluster.fork();
            });
        }
    } else {
        await startApplication();
    }
}

async function initializeFrontend(): Promise<void> {

    // load registered plugins
    const pluginDirs = [
        'frontend-applications',
        'frontend-applications/agent-portal/modules'
    ];
    await PluginService.getInstance().init(pluginDirs.map((pd) => path.join('..', pd)));

    // create initial data
    const initialDataExtensions = await PluginService.getInstance().getExtensions<IInitialDataExtension>(
        AgentPortalExtensions.INITIAL_DATA
    );
    LoggingService.getInstance().info(`Create initial data (${initialDataExtensions.length} extensions)`);
    for (const extension of initialDataExtensions) {
        await extension.createData().catch((e) => {
            LoggingService.getInstance().error(`Error creating inital data: ${extension.name}.`, e);
        });
    }

    await createClientRegistration();

    await MarkoService.getInstance().initializeMarkoApplications();
}

async function startApplication(aasWorker: boolean = false): Promise<any> {
    const options = {
        key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
        passphrase: 'kix2018'
    };

    const app = express();
    let server;

    const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
    if (serverConfig.USE_SSL) {
        server = https.createServer(options, app);
    } else {
        server = http.createServer(app);
    }

    await initApplication(app);

    const sio = require('socket.io');

    if (aasWorker) {
        sio.adapter(createAdapter());
        // setup connection with the primary process
        setupWorker(sio);
    }

    const io = sio.listen(server);
    await SocketService.getInstance().initialize(io);

    return server;
}

async function initApplication(application: express.Application): Promise<void> {
    const configDir = path.join(__dirname, '..', '..', 'config');
    const certDir = path.join(__dirname, '..', '..', 'cert');
    const dataDir = path.join(__dirname, '..', '..', 'data');
    ConfigurationService.getInstance().init(configDir, certDir, dataDir);

    const pluginDirs = [
        'frontend-applications',
        'frontend-applications/agent-portal/modules'
    ];
    await PluginService.getInstance().init(pluginDirs.map((pd) => path.join('..', pd)));

    try {
        const startUpBegin = Date.now();
        await Server.getInstance().initServer();
        const startUpEnd = Date.now();
        LoggingService.getInstance().info(`[SERVER] Ready - Startup in ${(startUpEnd - startUpBegin) / 1000}s`);
    } catch (error) {
        LoggingService.getInstance().error('Could not initialize server');
        LoggingService.getInstance().error(error);
    }

}


async function createClientRegistration(): Promise<void> {
    LoggingService.getInstance().info('Create ClientRegsitration');

    const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

    await ClientRegistrationService.getInstance().createClientRegistration(
        serverConfig.BACKEND_API_TOKEN
    ).catch((error) => {
        LoggingService.getInstance().error(error);
        LoggingService.getInstance().error(
            'Failed to register frontent server at backend (ClientRegistration). See errors above.'
        );
        process.exit(1);
    });

    LoggingService.getInstance().info('ClientRegistration created.');
}


initializeServer();