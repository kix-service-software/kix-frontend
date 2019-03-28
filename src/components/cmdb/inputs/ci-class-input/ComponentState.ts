import { AutoCompleteConfiguration, FormInputComponentState, TreeNode, ConfigItemClass } from "../../../../core/model";

export class ComponentState extends FormInputComponentState<ConfigItemClass> {

    public constructor(
        public isLoading: boolean = false,
        public nodes: TreeNode[] = [],
        public currentNode: TreeNode = null,
        public placeholder: string = ''
    ) {
        super();
    }

}
