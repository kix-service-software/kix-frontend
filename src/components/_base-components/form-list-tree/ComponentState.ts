import { TreeNode } from '../../../core/model';
import { IdService } from '../../../core/browser';

export class ComponentState {

    public constructor(
        public nodes: TreeNode[] = [],
        public filterValue: string = null,
        public treeId: string = 'tree-' + IdService.generateDateBasedId(),
        public activeNodes: TreeNode[] = null,
        public treeParent: any = null,
        public treeStyle: string = null
    ) { }

}
