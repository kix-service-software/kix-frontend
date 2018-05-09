import { TreeNode } from "@kix/core/dist/model";
import { IdService } from "@kix/core/dist/browser";

export class TreeComponentState {

    public constructor(
        public tree: TreeNode[] = [],
        public filterValue: string = null,
        public treeId: string = 'tree-' + IdService.generateDateBasedId(),
        public activeNode: TreeNode = null,
        public treeParent: any = null
    ) { }

}
