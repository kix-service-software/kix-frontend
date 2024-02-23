/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IAdminModuleExtension } from '../admin/server/IAdminModuleExtension';
import { AdminModuleCategory } from '../admin/model/AdminModuleCategory';
import { AdminModule } from '../admin/model/AdminModule';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';


import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'kix', 'Translatable#KIX', null, [
                new AdminModuleCategory(
                    null, 'automation', 'Translatable#Automation', null, [],
                    [
                        new AdminModule(
                            null, 'jobs', 'Translatable#Jobs', null,
                            KIXObjectType.JOB, 'admin-jobs',
                            [
                                new UIComponentPermission('system/automation/jobs', [CRUD.CREATE], true)
                            ]
                        )
                    ]
                )
            ])
        ];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
