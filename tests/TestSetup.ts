/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from "../src/server/services/ConfigurationService";
import { PluginService } from "../src/server/services/PluginService";

ConfigurationService.getInstance().init(__dirname + '/../config/', __dirname + '/../cert', __dirname + '/../data');
PluginService.getInstance().init(['extensions']);
