import { AutoCompleteConfiguration, Contact, FormInputComponentState, TreeNode } from "../../../../../core/model";

export class ComponentState extends FormInputComponentState<Contact> {

    public constructor(
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public isLoading: boolean = false,
        public nodes: TreeNode[] = [],
        public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]> = null,
        public currentNode: TreeNode = null
    ) {
        super();
    }

}
