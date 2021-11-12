/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { IFormFieldValidator } from '../../../base-components/webapp/core/IFormFieldValidator';
import { ValidationResult } from '../../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../base-components/webapp/core/ValidationSeverity';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DynamicFormFieldOption } from './DynamicFormFieldOption';
import { DynamicField } from '../../model/DynamicField';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { DynamicFieldTypes } from '../../model/DynamicFieldTypes';
import { ContextService } from '../../../base-components/webapp/core/ContextService';

export class DynamicFieldDateTimeValidator implements IFormFieldValidator {

    public validatorId: string = 'DynamicFieldDateTimeValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === KIXObjectProperty.DYNAMIC_FIELDS;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue(formField.instanceId);
        const fieldValue = value ? value.value : null;
        if (fieldValue && fieldValue instanceof Date) {
            const nameOption = formField.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);

            if (nameOption) {
                const dynamicField = await KIXObjectService.loadDynamicField(nameOption.value);
                if (this.isValidatorForDF(dynamicField)) {
                    return await this.checkDynamicField(dynamicField, fieldValue, formField.label);
                }
            }
        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }

    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return dynamicField.FieldType === DynamicFieldTypes.DATE ||
            dynamicField.FieldType === DynamicFieldTypes.DATE_TIME;
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        return await this.checkDynamicField(dynamicField, value, dynamicField.Label);
    }

    private async checkDynamicField(dynamicField: DynamicField, value: Date, label: string): Promise<ValidationResult> {
        if (dynamicField && value) {
            if (typeof value === 'string') {
                value = new Date(value);
            }

            if (dynamicField.Config.DateRestriction) {
                const restricition = dynamicField.Config.DateRestriction;
                const currentTime = new Date();

                if (dynamicField.FieldType === DynamicFieldTypes.DATE) {
                    currentTime.setHours(0, 0, 0, 0);
                }

                if (restricition === 'DisableFutureDates' && value > currentTime) {
                    const fieldLabel = await TranslationService.translate(label);
                    const errorMessage = await TranslationService.translate(
                        // tslint:disable-next-line:max-line-length
                        'Translatable#The value for the field is in the future! The date needs to be in the past!'
                    );
                    const errorString = await TranslationService.translate(
                        'Translatable#Field {0} has an invalid value ({1}).', [fieldLabel, errorMessage]
                    );
                    return new ValidationResult(ValidationSeverity.ERROR, errorString);
                } else if (restricition === 'DisablePastDates' && value < currentTime) {
                    const fieldLabel = await TranslationService.translate(label);
                    const errorMessage = await TranslationService.translate(
                        // tslint:disable-next-line:max-line-length
                        'The value for the field is in the past! The date needs to be in the future!'
                    );
                    const errorString = await TranslationService.translate(
                        'Translatable#Field {0} has an invalid value ({1}).', [fieldLabel, errorMessage]
                    );
                    return new ValidationResult(ValidationSeverity.ERROR, errorString);
                }

                const currentYear = currentTime.getFullYear();
                const selectedYear = value.getFullYear();

                const yearsInPast = Number(dynamicField.Config.YearsInPast);
                if (yearsInPast && yearsInPast > 0) {
                    if ((currentYear - yearsInPast) > selectedYear) {
                        const fieldLabel = await TranslationService.translate(label);
                        const errorMessage = await TranslationService.translate(
                            // tslint:disable-next-line:max-line-length
                            'Translatable#The year can be a maximum of {0} years in the past', [yearsInPast]
                        );
                        const errorString = await TranslationService.translate(
                            'Translatable#Field {0} has an invalid value ({1}).', [fieldLabel, errorMessage]
                        );
                        return new ValidationResult(ValidationSeverity.ERROR, errorString);
                    }
                }

                const yearsInFuture = Number(dynamicField.Config.YearsInFuture);
                if (yearsInFuture && yearsInFuture > 0) {
                    if ((currentYear + yearsInFuture) < selectedYear) {
                        const fieldLabel = await TranslationService.translate(label);
                        const errorMessage = await TranslationService.translate(
                            // tslint:disable-next-line:max-line-length
                            'Translatable#The year can be a maximum of {0} years in the future', [yearsInPast]
                        );
                        const errorString = await TranslationService.translate(
                            'Translatable#Field {0} has an invalid value ({1}).', [fieldLabel, errorMessage]
                        );
                        return new ValidationResult(ValidationSeverity.ERROR, errorString);
                    }
                }
            }
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }
}
