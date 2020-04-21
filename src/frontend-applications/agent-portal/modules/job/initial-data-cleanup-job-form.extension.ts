/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IInitialDataExtension } from "../../model/IInitialDataExtension";
import { ConfigurationService } from "../../../../server/services/ConfigurationService";
import { KIXObjectType } from "../../model/kix/KIXObjectType";
import { KIXExtension } from "../../../../server/model/KIXExtension";
import { SysConfigService } from "../sysconfig/server/SysConfigService";
import { ReleaseInfoUtil } from "../../../../server/ReleaseInfoUtil";
import { LoggingService } from "../../../../server/services/LoggingService";

class Extension extends KIXExtension implements IInitialDataExtension {

    public name: string = 'Job Migration 3364';

    public async createData(): Promise<void> {

        const releaseInfo = await ReleaseInfoUtil.getInstance().getReleaseInfo();
        if (releaseInfo.buildNumber >= 3364) {

            LoggingService.getInstance().info(`Migrate Job Form (Build: ${releaseInfo.buildNumber})`);

            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

            const deleteIds = [
                // Pages
                'job-new-form-page-information',
                'job-new-form-page-actions',
                'job-new-form-page-execution-plan',
                'job-new-form-page-filters',

                'job-edit-form-page-information',
                'job-edit-form-page-actions',
                'job-edit-form-page-execution-plan',
                'job-edit-form-page-filters',

                // Groups
                'job-new-form-group-information',
                'job-new-form-group-actions',
                'job-new-form-group-time_based',
                'job-new-form-group-event_based',
                'job-new-form-group-filters',

                'job-edit-form-group-information',
                'job-edit-form-group-actions',
                'job-edit-form-group-time_based',
                'job-edit-form-group-event_based',
                'job-edit-form-group-filters',

                // Fields
                'job-new-form-group-information',
                'job-new-form-field-name',
                'job-new-form-field-comment',
                'job-new-form-field-valid',
                'job-new-form-field-weekdays',
                'job-new-form-field-times',
                'job-new-form-field-valid',
                'job-new-form-field-events',
                'job-new-form-field-filters',
                'job-new-form-field-actions',

                'job-edit-form-group-information',
                'job-edit-form-field-name',
                'job-edit-form-field-comment',
                'job-edit-form-field-valid',
                'job-edit-form-field-weekdays',
                'job-edit-form-field-times',
                'job-edit-form-field-valid',
                'job-edit-form-field-events',
                'job-edit-form-field-filters',
                'job-edit-form-field-actions',
            ];

            await SysConfigService.getInstance().deleteObjects(
                serverConfig.BACKEND_API_TOKEN, '', KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, deleteIds
            );
        }
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};