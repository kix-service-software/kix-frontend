/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration, FormInputComponentState, TreeNode } from '../../../../../core/model';
import { IdService } from '../../../../../core/browser';

export class ComponentState extends FormInputComponentState<string | number> {

    public constructor(
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public isLoading: boolean = false,
        public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]> = null,
        public placeholder: string = '',
        public loadNodes: () => Promise<TreeNode[]> = null,
        public multiselect: boolean = false,
        public treeId: string = IdService.generateDateBasedId('object-reference-input-'),
        public prepared: boolean = false,
        public freeText: boolean = false
    ) {
        super();
    }

}
