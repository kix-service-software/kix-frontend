/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponentState } from '../../../../../modules/base-components/webapp/core/FormInputComponentState';
import { IdService } from '../../../../../model/IdService';

export class CompontentState extends FormInputComponentState {

    public constructor(
        public placeholder: string = '',
        public treeId: string = IdService.generateDateBasedId('language-input-'),
        public prepared: boolean = false
    ) {
        super();
    }

}
