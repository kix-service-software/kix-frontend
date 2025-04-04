/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from './services/ConfigurationService';
import { LoggingService } from './services/LoggingService';
import { ServerUtil } from './ServerUtil';

require('@marko/compiler/register')({ meta: true });

const path = require('path');

process.setMaxListeners(0);

async function preBuildApplications(): Promise<void> {

    const configDir = path.join(__dirname, '..', '..', 'config');
    const certDir = path.join(__dirname, '..', '..', 'cert');
    const dataDir = path.join(__dirname, '..', '..', 'data');
    ConfigurationService.getInstance().init(configDir, certDir, dataDir);

    LoggingService.getInstance().info('Starting Application Builder');
    LoggingService.getInstance().info(`Environment: ${process.env.NODE_ENV}`);

    await ServerUtil.initPlugins();

    LoggingService.getInstance().info('Build Applications');

    await ServerUtil.buildApplications();

    process.exit();
}

preBuildApplications();