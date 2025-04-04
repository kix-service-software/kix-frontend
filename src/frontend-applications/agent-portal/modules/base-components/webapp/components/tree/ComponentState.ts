/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TreeNode } from '../../core/tree';
import { IdService } from '../../../../../model/IdService';
import { AbstractComponentState } from '../../core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public tree: TreeNode[] = [],
        public filterValue: string = null,
        public treeId: string = 'tree-' + IdService.generateDateBasedId(),
        public activeNode: TreeNode = null,
        public treeStyle: string = null,
        public allowExpandCollapseAll: boolean = true
    ) {
        super();
    }

}
