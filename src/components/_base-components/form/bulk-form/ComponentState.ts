import { KIXObject } from "../../../../core/model";
import { BulkManager } from "../../../../core/browser/bulk";
import { ITable } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public objectCount: number = 0,
        public table: ITable = null,
        public bulkManager: BulkManager = null,
        public tableTitle: string = 'Ausgewählte Objekte',
        public canRun: boolean = false,
        public run: boolean = false
    ) { }

}
