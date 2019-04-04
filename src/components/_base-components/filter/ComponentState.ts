import { KIXObjectPropertyFilter, TreeNode, ObjectIcon } from '../../../core/model';

export class ComponentState {

    public constructor(
        public textFilterValue: string = '',
        public predefinedFilter: KIXObjectPropertyFilter[] = [],
        public predefinedFilterList: TreeNode[] = [],
        public predefinedFilterPlaceholder: string = 'Translatable#All Objects',
        public currentFilter: TreeNode = null,
        public icon: string | ObjectIcon = 'kix-icon-filter',
        public placeholder: string = 'Translatable#Filter in list',
        public filterCountString: string = null,
        public showFilterCount: boolean = true,
        public disabled: boolean = false
    ) { }

}
