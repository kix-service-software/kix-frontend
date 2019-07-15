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
