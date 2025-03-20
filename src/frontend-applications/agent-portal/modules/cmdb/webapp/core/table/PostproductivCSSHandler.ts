/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableValue } from '../../../../table/model/TableValue';
import { ITableCSSHandler } from '../../../../table/webapp/core/css-handler/ITableCSSHandler';
import { ConfigItem } from '../../../model/ConfigItem';

export class PostproductivCSSHandler implements ITableCSSHandler {

    public async getRowCSSClasses(configItem: ConfigItem): Promise<string[]> {
        const classes = [];

        if (configItem?.CurDeplStateType === 'postproductive') {
            classes.push('invalid-object');
        }

        return classes;
    }

    public async getValueCSSClasses(object: ConfigItem, value: TableValue): Promise<string[]> {
        return [];
    }



}
