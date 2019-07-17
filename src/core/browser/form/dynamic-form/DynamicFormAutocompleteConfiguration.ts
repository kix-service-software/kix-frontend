import { AutoCompleteConfiguration, TreeNode } from "../../../model";

export class DynamicFormAutocompleteConfiguration {

    public constructor(
        public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]>,
        public configuration: AutoCompleteConfiguration = null,
        public isFreeText: boolean = false,
    ) { }
}
