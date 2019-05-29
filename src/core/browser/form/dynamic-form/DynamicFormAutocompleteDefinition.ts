import { AutoCompleteConfiguration, TreeNode } from "../../../model";

export class DynamicFormAutocompleteDefinition {

    public constructor(
        public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]>,
        public configuration: AutoCompleteConfiguration = null,
        public isFreeText: boolean = false,
    ) { }
}
