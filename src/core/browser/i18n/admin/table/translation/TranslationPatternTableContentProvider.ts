import { TableContentProvider } from "../../../../table/TableContentProvider";
import {
    KIXObjectType, KIXObjectLoadingOptions, TranslationPattern, TranslationPatternProperty
} from "../../../../../model";
import { ITable, IRowObject, TableValue, RowObject } from "../../../../table";
import { KIXObjectService } from "../../../../kix";

export class TranslationPatternTableContentProvider extends TableContentProvider<TranslationPattern> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TRANSLATION_PATTERN, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<TranslationPattern>>> {
        let objects = [];
        if (!this.objectIds || (this.objectIds && this.objectIds.length > 0)) {
            objects = await KIXObjectService.loadObjects<TranslationPattern>(
                this.objectType, this.objectIds, this.loadingOptions, null, false
            );
        }

        const rowObjects = objects.map((t) => {
            const values: TableValue[] = [];

            for (const property in t) {
                if (t.hasOwnProperty(property)) {
                    if (property === TranslationPatternProperty.VALUE) {
                        values.push(new TableValue(property, t[property], t[property]));
                    } else {
                        values.push(new TableValue(property, t[property]));
                    }
                }
            }

            return new RowObject<TranslationPattern>(values, t);
        });

        return rowObjects;
    }

}