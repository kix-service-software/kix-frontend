/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration } from './AutoCompleteConfiguration';
import { FormGroup } from './FormGroup';
import { KIXObjectType } from '../..';
import { FormContext } from './FormContext';

export class Form {

    public constructor(
        public id: string,
        public name: string,
        public groups: FormGroup[],
        public objectType: KIXObjectType,
        public validation: boolean = true,
        public formContext: FormContext = FormContext.NEW,
        public autoCompleteConfiguration: AutoCompleteConfiguration = new AutoCompleteConfiguration(),
        public singleFormGroupOpen: boolean = false,
        public showSingleGroup: boolean = false
    ) { }

}
