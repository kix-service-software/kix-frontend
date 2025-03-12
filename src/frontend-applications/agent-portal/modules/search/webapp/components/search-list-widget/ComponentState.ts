import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';
import { TreeNode } from '../../../../base-components/webapp/core/tree';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public instanceId: string = null,
        public userSearches: TreeNode[] = [],
        public sharedSearches: TreeNode[] = [],
        public activeNode: TreeNode = null,
        public prepared: boolean = true
    ) {
        super();
    }

}