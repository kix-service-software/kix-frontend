import { KIXObjectType, KIXObject, FormField } from "../../../../core/model";
import { StandardTable } from "../../../../core/browser";
import { BulkManager } from "../../../../core/browser/bulk";

export class ComponentState {

    public constructor(
        public objectType: KIXObjectType = null,
        public objectCount: number = 0,
        public table: StandardTable<KIXObject> = null,
        public bulkManager: BulkManager = null
    ) { }

}
