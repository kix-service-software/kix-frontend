import { KIXObjectType, KIXObject } from "../../../../core/model";
import { StandardTable } from "../../../../core/browser";
import { BulkManager } from "../../../../core/browser/bulk";

export class ComponentState {

    public constructor(
        public objectType: KIXObjectType = null,
        public objectCount: number = 0,
        public table: StandardTable<KIXObject> = null,
        public bulkManager: BulkManager = null,
        public tableTitle: string = 'Ausgewählte Objekte'
    ) { }

}
