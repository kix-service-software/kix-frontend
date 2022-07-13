/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { InputFieldTypes } from '../../../base-components/webapp/core/InputFieldTypes';
import { ObjectFormValueMapper } from '../ObjectFormValueMapper';
import { ObjectFormValue } from './ObjectFormValue';

export class DateTimeFormValue extends ObjectFormValue<string> {

    public inputType: InputFieldTypes = InputFieldTypes.DATE_TIME;
    public minDate: string;
    public maxDate: string;

    public constructor(
        public property: string,
        object: any,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, object, objectValueMapper, parent);
        this.inputComponentId = 'datetime-form-input';
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        await super.initFormValueByField(field);
        const typeOption = field?.options.find(
            (o) => o.option === FormFieldOptions.INPUT_FIELD_TYPE
        );

        this.inputType = typeOption?.value?.toString() || InputFieldTypes.DATE_TIME;

        const minDateOption = field?.options.find((o) => o.option === FormFieldOptions.MIN_DATE);
        this.minDate = minDateOption ? minDateOption.value : null;

        const maxDateOption = field?.options.find((o) => o.option === FormFieldOptions.MAX_DATE);
        this.maxDate = maxDateOption ? maxDateOption.value : null;
    }

}