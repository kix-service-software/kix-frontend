import { TableContentProvider } from "../../../../table/TableContentProvider";
import {
    KIXObjectType, KIXObjectLoadingOptions, TranslationLanguage, Translation,
    TranslationLanguageProperty, DataType, SortOrder, SortUtil
} from "../../../../../model";
import { ITable, IRowObject, TableValue, RowObject } from "../../../../table";
import { ContextService } from "../../../../context";

export class TranslationLanguageTableContentProvider extends TableContentProvider<TranslationLanguage> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TRANSLATION_LANGUAGE, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<TranslationLanguage>>> {
        let rowObjects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            const translation = await context.getObject<Translation>();
            if (translation && translation.Languages && !!translation.Languages.length) {
                rowObjects = SortUtil.sortObjects(
                    translation.Languages, TranslationLanguageProperty.LANGUAGE,
                    DataType.STRING, SortOrder.DOWN
                ).map((l) => {
                    const values: TableValue[] = [];

                    for (const property in l) {
                        if (l.hasOwnProperty(property)) {
                            values.push(new TableValue(property, l[property]));
                        }
                    }

                    return new RowObject<TranslationLanguage>(values, l);
                });
            }
        }

        return rowObjects;
    }
}
