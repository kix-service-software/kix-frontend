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

export class ComponentState extends FormInputComponentState {

    public constructor(
        public currentValue: Date = null,
        public placeholder: string = null,
        public inputType: string = 'date',
        public dateValue: string = null,
        public timeValue: string = null,
        public minDate: string = null,
        public maxDate: string = null,
        public inputId: string = IdService.generateDateBasedId('date-time-input-')
    ) {
        super();
    }

}
