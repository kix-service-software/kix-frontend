import { TableTreeNode } from "../../../core/model";
import { IdService } from "../../../core/browser";

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
