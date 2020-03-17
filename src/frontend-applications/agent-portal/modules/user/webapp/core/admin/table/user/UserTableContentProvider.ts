/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../../../../../base-components/webapp/core/table/TableContentProvider";
import { User } from "../../../../../model/User";
import { ITable } from "../../../../../../base-components/webapp/core/table";
import { KIXObjectLoadingOptions } from "../../../../../../../model/KIXObjectLoadingOptions";
import { KIXObjectType } from "../../../../../../../model/kix/KIXObjectType";


export class UserTableContentProvider extends TableContentProvider<User> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.USER, table, objectIds, loadingOptions, contextId);
    }

}
