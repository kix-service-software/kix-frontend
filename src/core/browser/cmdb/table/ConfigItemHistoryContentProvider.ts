import { IRowObject, RowObject, ITable, TableValue } from "../../table";
import { KIXObjectType, KIXObjectLoadingOptions, ConfigItemHistory, ConfigItem } from "../../../model";
import { ContextService } from "../../context";
import { TableContentProvider } from "../../table/TableContentProvider";

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
