/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../../model/IdService';
import { AutoCompleteConfiguration } from '../../../../../../model/configuration/AutoCompleteConfiguration';
import { TreeNode } from '../../../core/tree';

export class ComponentState {

    public constructor(
        public hasListFilter: boolean = true,
        public placeholder: string = '',
        public filterText: string = '',
        public treeId: string = IdService.generateDateBasedId('table-column-filter-'),
        public prepared: boolean = false,
        public isAutocompleteFilter: boolean = false,
        public autoCompleteConfiguration = new AutoCompleteConfiguration(),
        public autoCompleteCallback: (limit: number, searchValue: string) => Promise<TreeNode[]> = null
    ) { }

}
