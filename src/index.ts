/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Server } from './Server';
import { CoreServiceRegistry, ConfigurationService, LoggingService } from './core/services';
import { PluginService, ModuleConfigurationService } from './services';

import path = require('path');
import { IConfigurationExtension, KIXExtensions } from './core/extensions';
import { Error } from './core/model';
import { IConfiguration } from './core/model/configuration';

process.setMaxListeners(0);

class Startup {

    private server: Server;

    public constructor() {
        this.initApplication();
    }

    private async initApplication(): Promise<void> {
        const configDir = path.join(__dirname, '..', 'config');
        const certDir = path.join(__dirname, '..', 'cert');
        ConfigurationService.getInstance().init(configDir, certDir);

        PluginService.getInstance().init(['extensions']);

        await this.bindServices();

        this.server = Server.getInstance();
        await this.server.initServer();

        await this.server.initHttpServer();
    }

    private async bindServices(): Promise<void> {
        await CoreServiceRegistry.registerCoreServices();
    }
}

const startup = new Startup();
