import { TableContentProvider } from "../../../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, Translation } from "../../../../../model";
import { ITable } from "../../../../table";

export class TranslationTableContentProvider extends TableContentProvider<Translation> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TRANSLATION, table, objectIds, loadingOptions, contextId);
    }

}
