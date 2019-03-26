import { FormInputComponentState, TreeNode } from '../../../../../core/model';

export class CompontentState extends FormInputComponentState<string> {

    public constructor(
        public nodes: TreeNode[] = [],
        public currentNode: TreeNode = null
    ) {
        super();
    }

}
