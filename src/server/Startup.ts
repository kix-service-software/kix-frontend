/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from './services/ConfigurationService';
import { ServerUtil } from './ServerUtil';

process.setMaxListeners(0);

const path = require('path');

async function run(): Promise<void> {
    const dataDir = path.join(__dirname, '..', '..', 'data');
    ConfigurationService.getInstance().init(dataDir);
    await ServerUtil.initPlugins();

    await ServerUtil.createClientRegistration();
    await ServerUtil.importInitialData();

    if (ConfigurationService.getEnvNumber('FE_UPDATE') === 1) {
        await ServerUtil.migrate();
    }

    process.exit();
}

run();


