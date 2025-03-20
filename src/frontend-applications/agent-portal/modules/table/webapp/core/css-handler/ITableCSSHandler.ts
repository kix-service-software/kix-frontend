/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../../model/kix/KIXObject';
import { TableValue } from '../../../model/TableValue';

export interface ITableCSSHandler<T = KIXObject> {

    getRowCSSClasses(object: T): Promise<string[]>;

    getValueCSSClasses(object: T, value: TableValue): Promise<string[]>;

}
