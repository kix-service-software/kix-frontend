import { TableContentProvider } from "../../../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, Translation, TranslationProperty } from "../../../../../model";
import { ITable, IRowObject, TableValue, RowObject } from "../../../../table";
import { KIXObjectService } from "../../../../kix";

export class TranslationTableContentProvider extends TableContentProvider<Translation> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TRANSLATION, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<Translation>>> {
        let objects = [];
        if (!this.objectIds || (this.objectIds && this.objectIds.length > 0)) {
            objects = await KIXObjectService.loadObjects<Translation>(
                this.objectType, this.objectIds, this.loadingOptions, null, false
            );
        }

        const rowObjects = objects.map((t) => {
            const values: TableValue[] = [];

            for (const property in t) {
                if (t.hasOwnProperty(property)) {
                    if (property === TranslationProperty.PATTERN) {
                        values.push(new TableValue(property, t[property], t[property]));
                    } else {
                        values.push(new TableValue(property, t[property]));
                    }
                }
            }

            return new RowObject<Translation>(values, t);
        });

        return rowObjects;
    }

}
