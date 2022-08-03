/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../../../model/IdService';
import { TreeNode } from '../../../../../../base-components/webapp/core/tree';
import { CheckListItem } from '../../../../../../dynamic-fields/webapp/core/CheckListItem';

export class ComponentState {

    public constructor(
        public item: CheckListItem = null,
        public nodes: TreeNode[] = [],
        public prepared: boolean = false,
        public dropdownId: string = IdService.generateDateBasedId('-checklist-dropdown'),
        public selectedNode: TreeNode = null
    ) { }

}
