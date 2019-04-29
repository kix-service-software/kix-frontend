import { FormInputComponentState, TreeNode } from '../../../../../../core/model';
import { PendingTimeFormValue } from '../../../../../../core/browser/ticket';

export class ComponentState extends FormInputComponentState<PendingTimeFormValue> {

    public constructor(
        public nodes: TreeNode[] = [],
        public currentNode: TreeNode = null,
        public placeholder: string = ''
    ) {
        super();
    }

}
