/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITableCSSHandler, TableValue } from '../../table';
import { SysConfigOptionDefinition } from '../../../model';
import { SysConfigAccessLevel } from '../../../model/kix/sysconfig/SysConfigAccessLevel';

export class SysConfigTableCSSHandler implements ITableCSSHandler<SysConfigOptionDefinition> {

    public async getRowCSSClasses(definition: SysConfigOptionDefinition): Promise<string[]> {
        const classes = [];

        if (definition && definition.AccessLevel === SysConfigAccessLevel.CONFIDENTIAL) {
            classes.push('confidential');
        }

        return classes;
    }

    public async getValueCSSClasses(definition: SysConfigOptionDefinition, value: TableValue): Promise<string[]> {
        return [];
    }

}
