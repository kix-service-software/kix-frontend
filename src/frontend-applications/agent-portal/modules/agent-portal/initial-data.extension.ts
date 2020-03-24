/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IInitialDataExtension } from "../../model/IInitialDataExtension";
import { ObjectIconLoadingOptions } from "../../server/model/ObjectIconLoadingOptions";
import { ObjectIconService } from "../icon/server/ObjectIconService";
import { ConfigurationService } from "../../../../server/services/ConfigurationService";
import { KIXObjectType } from "../../model/kix/KIXObjectType";
import { ObjectIcon } from "../icon/model/ObjectIcon";
import { LoggingService } from "../../../../server/services/LoggingService";


class Extension implements IInitialDataExtension {

    public name: string = 'Agent Portal Module';

    public async createData(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

        const logoLoadingOptions = new ObjectIconLoadingOptions('agent-portal-logo', 'agent-portal-logo');
        const icons = await ObjectIconService.getInstance().loadObjects(
            serverConfig.BACKEND_API_TOKEN, '', KIXObjectType.OBJECT_ICON, null, null, logoLoadingOptions
        );

        if (!icons || !icons.length) {
            try {
                const fs = require('fs');
                const image = fs.readFileSync(
                    __dirname + '/../../static/img/kix-cloud-logo.png',
                    { encoding: 'base64' }
                );
                const logo = new ObjectIcon('agent-portal-logo', 'agent-portal-logo', 'image/png', image);
                await ObjectIconService.getInstance().createIcons(serverConfig.BACKEND_API_TOKEN, '', logo)
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
