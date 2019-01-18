import { KIXObject } from "../../../../core/model";
import { StandardTable } from "../../../../core/browser";
import { BulkManager } from "../../../../core/browser/bulk";

export class ComponentState {

    public constructor(
        public objectCount: number = 0,
        public table: StandardTable<KIXObject> = null,
        public bulkManager: BulkManager = null,
        public tableTitle: string = 'Ausgewählte Objekte',
        public canRun: boolean = false,
        public run: boolean = false
    ) { }

}
