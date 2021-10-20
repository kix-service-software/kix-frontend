/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITableCSSHandler } from './ITableCSSHandler';
import { TableValue } from './TableValue';
import { KIXObject } from '../../../../../model/kix/KIXObject';

export class InvalidObjectCSSHandler implements ITableCSSHandler {

    public async getRowCSSClasses(object: KIXObject): Promise<string[]> {
        const classes = [];

        // first part ist needed to ignore objects without ValidID property (e.g tickets, assets)
        if (object?.ValidID && object?.ValidID !== 1) {
            classes.push('invalid-object');
        }

        return classes;
    }

    public async getValueCSSClasses(object: KIXObject, value: TableValue): Promise<string[]> {
        return [];
    }



}
