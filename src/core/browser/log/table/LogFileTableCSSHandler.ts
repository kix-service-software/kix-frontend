import { ITableCSSHandler, TableValue } from "../../table";
import { LogFile } from "../../../model/kix/log";

export class LogFileTableCSSHandler implements ITableCSSHandler<LogFile> {

    public getRowCSSClasses(logFile: LogFile): string[] {
        return ['linked-row'];
    }

    public getValueCSSClasses(logFile: LogFile, value: TableValue): string[] {
        return [];
    }


}
