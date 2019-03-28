import { TreeNode } from "../../../../core/model";
import { AbstractComponentState } from "../../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public loading: boolean = false,
        public classNodes: TreeNode[] = [],
        public currentClassNode: TreeNode = null,
        public formId: string = null,
        public placeholder: string = ''
    ) {
        super();
    }

}
