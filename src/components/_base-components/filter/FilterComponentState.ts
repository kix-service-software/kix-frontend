import { KIXObjectPropertyFilter, TreeNode } from "@kix/core/dist/model";

export class FilterComponentState {

    public textFilterValue: string = '';
    public predefinedFilter: KIXObjectPropertyFilter[] = [];
    public predefinedFilterList: TreeNode[] = [];
    public predefinedFilterPlaceholder: string = 'Alle Objekte';
    public currentFilter: TreeNode = null;

}
