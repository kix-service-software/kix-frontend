import { AutoCompleteConfiguration, FormInputComponentState, TreeNode, ConfigItem } from "@kix/core/dist/model";

export class ComponentState extends FormInputComponentState<ConfigItem> {

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
