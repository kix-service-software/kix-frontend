/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TreeNode } from '../../../core/tree';

export class ComponentState {

    public constructor(
        public node: TreeNode,
        public activeNode: TreeNode = null,
        public treeParent: any = null,
        public treeId: string = null,
        public nodeId: string = null
    ) { }

}
