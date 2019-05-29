import { AutoCompleteConfiguration, Contact, FormInputComponentState, TreeNode } from "../../../../../core/model";
import { Label, FormInputAction } from "../../../../../core/browser";

export class ComponentState extends FormInputComponentState<string[]> {

    public constructor(
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public isLoading: boolean = false,
        public nodes: TreeNode[] = [],
        public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]> = null,
        public currentNodes: TreeNode[] = [],
        public actions: FormInputAction[] = []
    ) {
        super();
    }

}
