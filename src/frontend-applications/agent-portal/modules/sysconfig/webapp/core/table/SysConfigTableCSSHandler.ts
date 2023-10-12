/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SysConfigOptionDefinition } from '../../../model/SysConfigOptionDefinition';
import { SysConfigAccessLevel } from '../../../model/SysConfigAccessLevel';
import { TableValue } from '../../../../table/model/TableValue';
import { ITableCSSHandler } from '../../../../table/webapp/core/css-handler/ITableCSSHandler';

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
