import { FormInputAction } from "../../../../../core/browser";
import { TreeNode, AutoCompleteConfiguration } from "../../../../../core/model";

export class ComponentInput {

    public disabled: boolean;

    public actions: FormInputAction[];

    public readonly: boolean;

    public invalid: boolean;

    public autocomplete: boolean;

    public multiselect: boolean;

    public freeText: boolean;

    public nodes: TreeNode[];

    public selectedNodes: TreeNode[];

    public autoCompleteConfiguration: AutoCompleteConfiguration;

    public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]>;

    public removeNode: boolean;

}
