import { TreeNode } from "../../../../../core/model";
import { BulkValue } from "./BulkValue";

export class ComponentState {

    public constructor(
        public bulkValues: BulkValue[] = []
    ) { }

}
