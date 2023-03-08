/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { NumberInputOptions } from '../../../base-components/webapp/core/NumberInputOptions';
import { ObjectFormValue } from './ObjectFormValue';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class NumberFormValue extends ObjectFormValue {

    public max: number;
    public min: number;
    public step: number;
    public unitString: string;

    public async initFormValue(): Promise<void> {
        this.inputComponentId = 'number-form-input';

        await super.initFormValue();
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        await super.initFormValueByField(field);

        if (field?.options) {
            const maxOption = field?.options.find(
                (o) => o.option === NumberInputOptions.MAX
            );
            if (maxOption) {
                this.max = maxOption.value;
            }
            const minOption = field?.options.find(
                (o) => o.option === NumberInputOptions.MIN
            );
            if (minOption) {
                this.min = minOption.value;
            }
            const stepOption = field?.options.find(
                (o) => o.option === NumberInputOptions.STEP
            );
            if (stepOption) {
                this.step = stepOption.value;
            }
            const unitStringOption = field?.options.find(
                (o) => o.option === NumberInputOptions.UNIT_STRING
            );
            if (unitStringOption) {
                const string = await TranslationService.translate(unitStringOption.value);
                this.unitString = ` ${string}`;
            }
        }
    }

    public async setObjectValue(value: any): Promise<void> {
        await super.setObjectValue(typeof value !== 'undefined' && value !== null ? Number(value) : null);
    }
}