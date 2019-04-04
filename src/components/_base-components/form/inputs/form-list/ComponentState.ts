import { TreeNode, AutoCompleteConfiguration } from '../../../../../core/model';
import { IdService } from '../../../../../core/browser/IdService';
import { FormInputAction, AbstractComponentState } from '../../../../../core/browser';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public nodes: TreeNode[] = [],
        public selectedNodes: TreeNode[] = [],
        public expanded: boolean = false,
        public listId: string = IdService.generateDateBasedId('form-list-'),
        public filterValue: string = null,
        public treeId: string = listId + '-tree',
        public readonly: boolean = true,
        public invalid: boolean = false,
        public treeStyle: any = null,
        public asAutocomplete: boolean = false,
        public autocompleteSearchValue: string = null,
        public isLoading: boolean = false,
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]> = null,
        public asMultiselect: boolean = false,
        public removeNode: boolean = true,
        public actions: FormInputAction[] = [],
        public placeholder: string = null,
        public autocompleteNotFoundText: string = null,
        public autoCompletePlaceholder: string = '',
        public disabled: boolean = false
    ) {
        super();
    }

}
