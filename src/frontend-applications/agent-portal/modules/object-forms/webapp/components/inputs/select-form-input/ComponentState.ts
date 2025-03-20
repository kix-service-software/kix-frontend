/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../../model/IdService';
import { AbstractComponentState } from '../../../../../base-components/webapp/core/AbstractComponentState';
import { TreeNode } from '../../../../../base-components/webapp/core/tree';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public prepared: boolean = false,
        public autoComplete: boolean = false,
        public searchLoading: boolean = false,
        public selectedNodes: TreeNode[] = [],
        public searchValueKey: string = IdService.generateDateBasedId('searchValue'),
        public treeId: string = null,
        public multiselect: boolean = false,
        public autoCompleteHint: string = null,
        public noResult: boolean = true,
        public searchPlaceholder: string = 'search ...',
        public hasFilter: boolean = false,
        public readonly: boolean = null,
        public dropdownAttributes: any = {},
        public selectAll: boolean = true
    ) {
        super();
    }

}