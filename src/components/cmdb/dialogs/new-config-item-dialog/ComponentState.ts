/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TreeNode } from "../../../../core/model";
import { AbstractComponentState } from "../../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public prepared: boolean = false,
        public formId: string = 'cmdb-config-item-new-form',
        public placeholder: string = '',
        public hint: string = null,
        public loadNodes: () => Promise<TreeNode[]> = null
    ) {
        super();
    }

}
