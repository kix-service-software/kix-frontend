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