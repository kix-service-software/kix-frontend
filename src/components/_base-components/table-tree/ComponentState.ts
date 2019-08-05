/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableTreeNode } from "../../../core/model";
import { IdService } from "../../../core/browser";

export class ComponentState {

    public constructor(
        public tree: TableTreeNode[] = [],
        public filterValue: string = null,
        public treeId: string = 'tree-' + IdService.generateDateBasedId(),
        public activeNode: TableTreeNode = null,
        public treeParent: any = null,
        public treeStyle: string = null,
        public titleNode: TableTreeNode = null
    ) { }

}
