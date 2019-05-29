import { FormInputComponentState, TreeNode, Organisation } from "../../../../../core/model";

export class ComponentState extends FormInputComponentState<number> {

    public constructor(
        public nodes: TreeNode[] = [],
        public currentNode: TreeNode = null,
        public primaryOrganisationId: number = null,
        public hasContact: boolean = false,
        public loading: boolean = false,
        public placeholder: string = ''
    ) {
        super();
    }

}
