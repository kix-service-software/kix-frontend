/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from './IConfiguration';
import { KIXObjectType } from '../kix/KIXObjectType';
import { FormPageConfiguration } from './FormPageConfiguration';
import { ConfigurationType } from './ConfigurationType';
import { AutoCompleteConfiguration } from './AutoCompleteConfiguration';
import { FormContext } from './FormContext';

export class FormConfiguration implements IConfiguration {

    public application: string = 'agent-portal';

    public constructor(
        public id: string,
        public name: string,
        public pageConfigurationIds: string[] = [],
        public objectType: KIXObjectType | string,
        public validation: boolean = true,
        public formContext: FormContext = FormContext.NEW,
        public autoCompleteConfiguration: AutoCompleteConfiguration = new AutoCompleteConfiguration(),
        public pages: FormPageConfiguration[] = [],
        public type: ConfigurationType = ConfigurationType.Form,
        public valid: boolean = true,
    ) { }

}
