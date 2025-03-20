/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TreeNode } from '../../base-components/webapp/core/tree';

export class GraphOption {

    public constructor(
        public key: string,
        public displayValue: string,
        public nodes: TreeNode[] = [],
        public freeText: boolean = false,
        public multiselect: boolean = true,
        public values: any = null
    ) { }

}