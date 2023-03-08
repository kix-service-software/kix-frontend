/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormContext } from '../../../../model/configuration/FormContext';
import { AutoCompleteConfiguration } from '../../../../model/configuration/AutoCompleteConfiguration';

export class SearchForm extends FormConfiguration {

    public constructor(
        formId: string,
        formName: string,
        objectType: KIXObjectType | string,
        formContext: FormContext = FormContext.SEARCH,
        autoCompleteConfiguration: AutoCompleteConfiguration = new AutoCompleteConfiguration(),
        public defaultSearchProperties: string[] = []
    ) {
        super(formId, formName, [], objectType, false, formContext, autoCompleteConfiguration);
    }

}
