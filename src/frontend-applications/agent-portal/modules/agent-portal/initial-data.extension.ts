/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IInitialDataExtension } from '../../model/IInitialDataExtension';
import { ObjectIconLoadingOptions } from '../../server/model/ObjectIconLoadingOptions';
import { ObjectIconService } from '../icon/server/ObjectIconService';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ObjectIcon } from '../icon/model/ObjectIcon';
import { LoggingService } from '../../../../server/services/LoggingService';
import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IInitialDataExtension {

    public name: string = 'Agent Portal Module';

    public async createData(): Promise<void> {
        await this.setObjectIcon('agent-portal-logo', '/../../../../static/img/kix_start.png');
        await this.setObjectIcon('agent-portal-icon', '/../../../../static/img/kix_start_icon.png');
        await this.setObjectIcon('agent-portal-icon-sw', '/../../../../static/img/kix_sw.png');
    }

    private async setObjectIcon(name: string, path: string): Promise<void> {
        const iconLoadingOptions = new ObjectIconLoadingOptions(name, name);
        const objectResponse = await ObjectIconService.getInstance().loadObjects(
            ConfigurationService.getBackendAPIToken(), '', KIXObjectType.OBJECT_ICON, null, null, iconLoadingOptions
        );

        const icons = objectResponse?.objects || [];

        if (!icons || !icons.length) {
            try {
                const fs = require('fs');
                const image = fs.readFileSync(
                    __dirname + path,
                    { encoding: 'base64' }
                );
                const newIcon = new ObjectIcon(null, name, name, 'image/png', image);
                await ObjectIconService.getInstance().createIcon(ConfigurationService.getBackendAPIToken(), '', newIcon)
                    .catch((e) => LoggingService.getInstance().error(e));
            } catch (e) {
                LoggingService.getInstance().error(e);
            }
        }
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
