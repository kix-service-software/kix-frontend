/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IAdminModuleExtension } from '../admin/server/IAdminModuleExtension';
import { AdminModule } from '../admin/model/AdminModule';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IAdminModuleExtension {

    public getAdminModules(): AdminModule[] {
        return [
            new AdminModule(
                null, 'kix', 'Translatable#KIX', null, null, null, [], 0, [
                new AdminModule(
                    null, 'communication', 'Translatable#Communication', null, null, null, [], 0,
                    [
                        new AdminModule(
                            null, 'communication_email', 'Translatable#Email', null, null, null, [], 0,
                            [
                                new AdminModule(
                                    null, 'system-address', 'Translatable#Email Addresses', null,
                                    KIXObjectType.SYSTEM_ADDRESS, 'admin-system-addresses',
                                    [
                                        new UIComponentPermission(
                                            'system/communication/systemaddresses', [CRUD.CREATE], true
                                        )

                                    ]
                                )
                            ], true
                        )
                    ], true
                )
            ], true)
        ];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
