import { AutoCompleteConfiguration, FormInputComponentState, TreeNode, KIXObject } from "../../../../../core/model";

export class ComponentState extends FormInputComponentState<KIXObject> {

    public constructor(
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public isLoading: boolean = false,
        public nodes: TreeNode[] = [],
        public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]> = null,
        public currentNode: TreeNode = null,
        public autocomplete: boolean = true
    ) {
        super();
    }

}
