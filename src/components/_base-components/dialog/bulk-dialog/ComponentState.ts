import { BulkManager } from "../../../../core/browser/bulk";

export class ComponentState {

    public constructor(
        public instanceId: string = null,
        public bulkManager: BulkManager = null
    ) { }

}
