import { TableContentProvider } from "../../../table/TableContentProvider";
import {
    KIXObjectType, KIXObjectLoadingOptions, ConfigItemClassDefinition,
    ConfigItemClass, SortUtil, ConfigItemClassDefinitionProperty, DataType, SortOrder
} from "../../../../model";
import { ITable, IRowObject, RowObject, TableValue } from "../../../table";
import { ContextService } from "../../../context";

export class ConfigItemClassDefinitionTableContentProvider extends TableContentProvider<ConfigItemClassDefinition> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<ConfigItemClassDefinition>>> {
        let rowObjects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            const configItemClass = await context.getObject<ConfigItemClass>();
            if (configItemClass && configItemClass.Definitions && !!configItemClass.Definitions.length) {
                rowObjects = SortUtil.sortObjects(
                    configItemClass.Definitions, ConfigItemClassDefinitionProperty.CREATE_TIME,
                    DataType.DATE, SortOrder.UP
                ).map((d) => {
                    const values: TableValue[] = [];

                    for (const property in d) {
                        if (d.hasOwnProperty(property)) {
                            values.push(new TableValue(property, d[property]));
                        }
                    }

                    return new RowObject<ConfigItemClassDefinition>(values, d);
                });
            }
        }

        return rowObjects;
    }

}
