/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITable, IRow, IColumn } from "../../core/table";

export class ComponentState {

    public constructor(
        public table: ITable = null,
        public rows: IRow[] = null,
        public columns: IColumn[] = [],
        public tableHeight: string = 'unset'
    ) { }

}
