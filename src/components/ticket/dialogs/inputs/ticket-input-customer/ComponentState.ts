import { FormInputComponentState, TreeNode, Customer } from "../../../../../core/model";

export class ComponentState extends FormInputComponentState<Customer> {

    public constructor(
        public nodes: TreeNode[] = [],
        public currentNode: TreeNode = null,
        public primaryCustomerId: string = null,
        public hasContact: boolean = false,
        public loading: boolean = false
    ) {
        super();
    }

}
