/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration, FormInputComponentState, TreeNode } from '../../../../../core/model';

export class ComponentState extends FormInputComponentState<string | number> {

    public constructor(
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public isLoading: boolean = false,
        public nodes: TreeNode[] = [],
        public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]> = null,
        public currentNodes: TreeNode[] = [],
        public autocomplete: boolean = true,
        public isMultiselect: boolean = false,
        public placeholder: string = ''
    ) {
        super();
    }

}
