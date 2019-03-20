import { AutoCompleteConfiguration, FormInputComponentState, TreeNode } from '../../../../../core/model';

export class ComponentState extends FormInputComponentState<string | number> {

    public constructor(
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public isLoading: boolean = false,
        public nodes: TreeNode[] = [],
        public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]> = null,
        public currentNodes: TreeNode[] = [],
        public autocomplete: boolean = true,
        public isMultiselect: boolean = false
    ) {
        super();
    }

}
