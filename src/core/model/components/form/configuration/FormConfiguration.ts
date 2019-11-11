/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration } from '../AutoCompleteConfiguration';
import { KIXObjectType } from '../../../';
import { FormContext } from '../FormContext';
import { ConfigurationType, IConfiguration } from '../../../configuration';
import { FormPageConfiguration } from './FormPageConfiguration';

export class FormConfiguration implements IConfiguration {

    public constructor(
        public id: string,
        public name: string,
        public pageConfigurationIds: string[],
        public objectType: KIXObjectType,
        public validation: boolean = true,
        public formContext: FormContext = FormContext.NEW,
        public autoCompleteConfiguration: AutoCompleteConfiguration = new AutoCompleteConfiguration(),
        public pages: FormPageConfiguration[] = [],
        public type: ConfigurationType = ConfigurationType.Form,
    ) { }

}
