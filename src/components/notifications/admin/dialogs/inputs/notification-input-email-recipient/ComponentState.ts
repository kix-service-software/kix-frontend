import { AutoCompleteConfiguration, FormInputComponentState, TreeNode } from "../../../../../../core/model";

export class ComponentState extends FormInputComponentState<string[]> {

    public constructor(
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public nodes: TreeNode[] = [],
        public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]> = null,
        public currentNodes: TreeNode[] = []
    ) {
        super();
    }

}
