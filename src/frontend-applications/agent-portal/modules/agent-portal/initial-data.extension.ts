/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { IServerConfiguration } from '../../../../server/model/IServerConfiguration';

class Extension extends KIXExtension implements IInitialDataExtension {

    public name: string = 'Agent Portal Module';

    public async createData(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

        await this.setObjectIcon(serverConfig, 'agent-portal-logo', '/../../static/img/kix_start.png');
        await this.setObjectIcon(serverConfig, 'agent-portal-icon', '/../../static/img/kix_start_icon.png');
        await this.setObjectIcon(serverConfig, 'agent-portal-icon-sw', '/../../static/img/kix_sw.png');
    }

    private async setObjectIcon(serverConfig: IServerConfiguration, name: string, path: string) {
        const iconLoadingOptions = new ObjectIconLoadingOptions(name, name);
        const icons = await ObjectIconService.getInstance().loadObjects(
            serverConfig.BACKEND_API_TOKEN, '', KIXObjectType.OBJECT_ICON, null, null, iconLoadingOptions
        );

        if (!icons || !icons.length) {
            try {
                const fs = require('fs');
                const image = fs.readFileSync(
                    __dirname + path,
                    { encoding: 'base64' }
                );
                const newIcon = new ObjectIcon(null, name, name, 'image/png', image);
                await ObjectIconService.getInstance().createIcon(serverConfig.BACKEND_API_TOKEN, '', newIcon)
                    .catch((e) => LoggingService.getInstance().error(e));
            } catch (e) {
                LoggingService.getInstance().error(e);
            }
        }
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
