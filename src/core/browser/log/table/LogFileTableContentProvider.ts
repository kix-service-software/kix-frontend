/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../table/TableContentProvider";
import { LogFile } from "../../../model/kix/log";
import { ITable } from "../../table";
import { KIXObjectLoadingOptions, KIXObjectType } from "../../../model";

export class LogFileTableContentProvider extends TableContentProvider<LogFile> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.LOG_FILE, table, objectIds, loadingOptions, contextId);
    }

}
