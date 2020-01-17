/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IRow } from "./IRow";
import { TableValue } from "./TableValue";
import { TableFilterCriteria } from "../../../../../model/TableFilterCriteria";
import { ObjectIcon } from "../../../../icon/model/ObjectIcon";
import { IColumnConfiguration } from "../../../../../model/configuration/IColumnConfiguration";

export interface ICell {

    getProperty(): string;

    getValue(): TableValue;

    setValue(value: TableValue): void;

    filter(filterValue?: string, criteria?: TableFilterCriteria[]): Promise<boolean>;

    getRow(): IRow;

    getColumnConfiguration(): IColumnConfiguration;

}
