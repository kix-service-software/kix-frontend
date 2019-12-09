/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../../../base-components/webapp/core/table/TableContentProvider";
import { ConfigItemHistory } from "../../../model/ConfigItemHistory";
import { ITable, IRowObject, TableValue, RowObject } from "../../../../base-components/webapp/core/table";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";
import { ConfigItem } from "../../../model/ConfigItem";

export class ConfigItemHistoryContentProvider extends TableContentProvider<ConfigItemHistory> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM_HISTORY, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<ConfigItemHistory>>> {
        let rowObjects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            const configItem = await context.getObject<ConfigItem>();
            if (configItem) {
                rowObjects = configItem.History
                    .sort((a, b) => b.HistoryEntryID - a.HistoryEntryID)
                    .map((ch) => {
                        const values: TableValue[] = [];

                        for (const property in ch) {
                            if (ch.hasOwnProperty(property)) {
                                values.push(new TableValue(property, ch[property]));
                            }
                        }

                        return new RowObject<ConfigItemHistory>(values, ch);
                    });
            }
        }

        return rowObjects;
    }
}
