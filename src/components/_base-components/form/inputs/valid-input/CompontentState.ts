import { FormInputComponentState, TreeNode } from '../../../../../core/model';

export class CompontentState extends FormInputComponentState<number> {

    public constructor(
        public nodes: TreeNode[] = [],
        public currentNode: TreeNode = null,
        public placeholder: string = ''
    ) {
        super();
    }

}
