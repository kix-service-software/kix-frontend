import { ITable } from "./ITable";

export class TableEventData {

    public constructor(
        public tableId: string,
        public rowId?: string,
        public columnId?: string,
        public table?: ITable
    ) { }
}
