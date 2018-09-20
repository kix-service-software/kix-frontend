import { KIXObjectPropertyFilter, TreeNode, ObjectIcon } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public textFilterValue: string = '',
        public predefinedFilter: KIXObjectPropertyFilter[] = [],
        public predefinedFilterList: TreeNode[] = [],
        public predefinedFilterPlaceholder: string = 'Alle Objekte',
        public currentFilter: TreeNode = null,
        public icon: string | ObjectIcon = 'kix-icon-filter',
        public placeholder: string = 'Filtern in Liste'
    ) { }

}
