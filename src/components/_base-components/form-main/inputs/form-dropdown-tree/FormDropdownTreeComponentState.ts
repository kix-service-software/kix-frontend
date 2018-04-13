import { FormDropdownItem, TreeNode } from '@kix/core/dist/model';
import { IdService } from '@kix/core/dist/browser/IdService';

export class FormDropdownTreeComponentState {

    public constructor(
        public nodes: TreeNode[] = [],
        public filteredNodes: TreeNode[] = [],
        public selectedNode: TreeNode = null,
        public expanded: boolean = false,
        public dropdownId: string = IdService.generateDateBasedId(),
        public filterValue: string = null,
        public preSelectedNode: TreeNode = null
    ) { }

}
