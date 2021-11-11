/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITableCSSHandler, TableValue } from '../../../../base-components/webapp/core/table';
import { SysConfigOptionDefinition } from '../../../model/SysConfigOptionDefinition';
import { SysConfigAccessLevel } from '../../../model/SysConfigAccessLevel';

export class SysConfigTableCSSHandler implements ITableCSSHandler<SysConfigOptionDefinition> {

    public async getRowCSSClasses(definition: SysConfigOptionDefinition): Promise<string[]> {
        const classes = [];

        if (definition?.AccessLevel === SysConfigAccessLevel.CONFIDENTIAL) {
            classes.push('confidential');
        }

        return classes;
    }

    public async getValueCSSClasses(definition: SysConfigOptionDefinition, value: TableValue): Promise<string[]> {
        return [];
    }

}
