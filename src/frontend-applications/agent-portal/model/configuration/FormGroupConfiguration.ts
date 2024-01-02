/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from './IConfiguration';
import { FormFieldConfiguration } from './FormFieldConfiguration';
import { ConfigurationType } from './ConfigurationType';

export class FormGroupConfiguration implements IConfiguration {

    public application: string = 'agent-portal';

    public constructor(
        public id: string,
        public name: string,
        public fieldConfigurationIds: string[] = [],
        public separatorString: string = null,
        public formFields: FormFieldConfiguration[] = [],
        public draggableFields: boolean = false,
        public type: ConfigurationType = ConfigurationType.FormGroup,
        public valid: boolean = true,
    ) { }

}
