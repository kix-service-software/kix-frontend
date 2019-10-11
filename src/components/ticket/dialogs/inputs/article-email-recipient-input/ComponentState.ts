/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration, FormInputComponentState, TreeNode } from "../../../../../core/model";
import { FormInputAction, IdService } from "../../../../../core/browser";

export class ComponentState extends FormInputComponentState<string[]> {

    public constructor(
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]> = null,
        public actions: FormInputAction[] = [],
        public treeId: string = IdService.generateDateBasedId('email-recipient-'),
        public prepared: boolean = false
    ) {
        super();
    }

}
