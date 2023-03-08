/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
