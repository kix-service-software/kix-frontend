import { TableTreeNode } from "@kix/core/dist/model";
import { IdService } from "@kix/core/dist/browser";

export class ComponentState {

    public constructor(
        public tree: TableTreeNode[] = [],
        public filterValue: string = null,
        public treeId: string = 'tree-' + IdService.generateDateBasedId(),
        public activeNode: TableTreeNode = null,
        public treeParent: any = null,
        public treeStyle: string = null,
        public titleNode: TableTreeNode = null
    ) { }

}
