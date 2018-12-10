import { KIXObjectType, TreeNode } from "@kix/core/dist/model";
import { FormSearchValue } from "./FormSearchValue";

export class ComponentState {

    public constructor(
        public propertyNodes: TreeNode[] = [],
        public searchValues: FormSearchValue[] = [],
    ) { }

}
