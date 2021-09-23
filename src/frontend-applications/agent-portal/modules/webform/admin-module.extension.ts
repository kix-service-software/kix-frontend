/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
                null, 'communication', 'Translatable#Communication', null, [],
                [
                    new AdminModule(
                        null, 'webforms', 'Translatable#Webform', null,
                        KIXObjectType.WEBFORM, 'admin-webforms',
                        [
                            new UIComponentPermission('system/ticket/types', [CRUD.CREATE, CRUD.READ]),
                            new UIComponentPermission('system/ticket/states', [CRUD.CREATE, CRUD.READ]),
                            new UIComponentPermission('system/ticket/priorities', [CRUD.CREATE, CRUD.READ]),
                            new UIComponentPermission('system/ticket/queues', [CRUD.CREATE, CRUD.READ])
                        ]
                    ),
                ])
        ];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
