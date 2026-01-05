/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormGroupConfiguration } from '../../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../../model/configuration/FormPageConfiguration';
import { FormConfigurationObject } from './FormConfigurationObject';
import { ObjectFormValue } from './FormValues/ObjectFormValue';

export class ObjectFormEventData {

    public constructor(
        public contextInstanceId?: string,
        public objectValueMapperInstanceId?: string,
        public formValueInstanceId?: string,
        public formValue?: ObjectFormValue,
        public canSubmit: boolean = true,
        public blocked: boolean = false,
        public formConfigurationObject?: FormConfigurationObject,
        public pageConfiguration?: FormPageConfiguration,
        public groupConfiguration?: FormGroupConfiguration,
        public pageId?: string
    ) { }

}