import { KIXObjectType, TreeNode } from "../../../../../core/model";
import { FormSearchValue } from "./FormSearchValue";

export class ComponentState {

    public constructor(
        public propertyNodes: TreeNode[] = [],
        public searchValues: FormSearchValue[] = [],
    ) { }

}
