/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponentState, TreeNode, GeneralCatalogItem } from '../../../../../../core/model';

export class CompontentState extends FormInputComponentState<GeneralCatalogItem> {

    public constructor(
        public nodes: TreeNode[] = [],
        public currentNode: TreeNode = null,
        public loading: boolean = true,
        public error: string = null,
        public placeholder: string = ''
    ) {
        super();
    }

}
