/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IRow } from "./IRow";
import { TableFilterCriteria } from "../../model";
import { IColumnConfiguration } from "./IColumnConfiguration";
import { ObjectIcon } from "../../model";
import { TableValue } from "./TableValue";

export interface ICell {

    getProperty(): string;

    getValue(): TableValue;

    setValue(value: TableValue): void;

    filter(filterValue?: string, criteria?: TableFilterCriteria[]): Promise<boolean>;

    getRow(): IRow;

    getDisplayValue(): Promise<string>;

    getDisplayIcons(): Promise<Array<string | ObjectIcon>>;

    getColumnConfiguration(): IColumnConfiguration;

}
