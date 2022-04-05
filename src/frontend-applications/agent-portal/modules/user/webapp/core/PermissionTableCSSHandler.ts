/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { TableValue } from '../../../table/model/TableValue';
import { ITableCSSHandler } from '../../../table/webapp/core/css-handler/ITableCSSHandler';
import { Permission } from '../../model/Permission';

export class PermissionTableCSSHandler implements ITableCSSHandler<Permission> {

    public async getRowCSSClasses(permission: Permission): Promise<string[]> {
        const classes = [];
        if (permission?.Value & CRUD.DENY) {
            classes.push('error');
        }

        return classes;
    }

    public async getValueCSSClasses(object: Permission, value: TableValue): Promise<string[]> {
        return [];
    }


}
