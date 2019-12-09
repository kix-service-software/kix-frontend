/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponentState } from "../../../../../modules/base-components/webapp/core/FormInputComponentState";
import { ConfigItemClass } from "../../../model/ConfigItemClass";
import { TreeNode } from "../../../../base-components/webapp/core/tree";


export class ComponentState extends FormInputComponentState<ConfigItemClass> {

    public constructor(
        public isLoading: boolean = false,
        public nodes: TreeNode[] = [],
        public currentNode: TreeNode = null,
        public placeholder: string = ''
    ) {
        super();
    }

}
