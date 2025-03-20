/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponentState } from '../../../../../modules/base-components/webapp/core/FormInputComponentState';
import { AutoCompleteConfiguration } from '../../../../../model/configuration/AutoCompleteConfiguration';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { FormInputAction } from '../../../../../modules/base-components/webapp/core/FormInputAction';
import { IdService } from '../../../../../model/IdService';

export class ComponentState extends FormInputComponentState {

    public constructor(
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]> = null,
        public placeholder: string = '',
        public actions: FormInputAction[] = [],
        public treeId: string = IdService.generateDateBasedId('TicketInputContact')
    ) {
        super();
    }

}
