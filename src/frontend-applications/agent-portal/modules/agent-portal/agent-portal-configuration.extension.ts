/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { AgentPortalConfiguration } from '../../model/configuration/AgentPortalConfiguration';
import { DisplayValueConfiguration } from '../../model/configuration/DisplayValueConfiguration';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'AgentPortal';
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        return [new AgentPortalConfiguration(), new DisplayValueConfiguration()];
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
