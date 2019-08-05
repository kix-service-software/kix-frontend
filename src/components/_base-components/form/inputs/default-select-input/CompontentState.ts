/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponentState, TreeNode } from '../../../../../core/model';

export class CompontentState extends FormInputComponentState<string | number | string[] | number[]> {

    public constructor(
        public nodes: TreeNode[] = [],
        public selectedNodes: TreeNode[] = null,
        public asMultiselect: boolean = false,
        public placeholder: string = ''
    ) {
        super();
    }

}
