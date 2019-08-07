/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, SystemAddress, FilterCriteria } from "../../../model";
import { ITable } from "../../table";

export class SystemAddressTableContentProvider extends TableContentProvider<SystemAddress> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.SYSTEM_ADDRESS, table, objectIds, loadingOptions, contextId);
    }

}
