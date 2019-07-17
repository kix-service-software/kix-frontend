import { AutoCompleteConfiguration, FormInputComponentState, TreeNode } from "../../../../../core/model";
import { FormInputAction } from "../../../../../core/browser";

export class ComponentState extends FormInputComponentState<string[]> {

    public constructor(
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public nodes: TreeNode[] = [],
        public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]> = null,
        public currentNodes: TreeNode[] = [],
        public actions: FormInputAction[] = []
    ) {
        super();
    }

}
