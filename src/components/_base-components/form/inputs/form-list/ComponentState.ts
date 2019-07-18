/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
