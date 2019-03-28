import { TreeNode } from "../../core/model";

export class ComponentState {

    public constructor(
        public bookmarks: TreeNode[] = [],
        public placeholder: string = ''
    ) { }

}
