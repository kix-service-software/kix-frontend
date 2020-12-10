/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IFormFieldValidator } from '../../../../../base-components/webapp/core/IFormFieldValidator';
import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { ValidationResult } from '../../../../../base-components/webapp/core/ValidationResult';
import { FormService } from '../../../../../base-components/webapp/core/FormService';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../../model/ContextType';
import { ArticleProperty } from '../../../../../ticket/model/ArticleProperty';
import { ValidationSeverity } from '../../../../../base-components/webapp/core/ValidationSeverity';
import { FormFieldValue } from '../../../../../../model/configuration/FormFieldValue';
import { LabelService } from '../../../../../base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { DynamicField } from '../../../../../dynamic-fields/model/DynamicField';
import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { JobProperty } from '../../../../model/JobProperty';
import { JobService } from '../../JobService';

export class JobFilterValidator implements IFormFieldValidator {

    public validatorId: string = 'JobFilterValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === JobProperty.FILTER;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {

        if (formField.property === JobProperty.FILTER) {
            const formInstance = await FormService.getInstance().getFormInstance(formId);
            const value = formInstance.getFormFieldValue(formField.instanceId);
            if (value && value.value && Array.isArray(value.value)) {
                const context = ContextService.getInstance().getActiveContext();
                if (context && context.getDescriptor().contextType === ContextType.DIALOG) {
                    const selectedEvents = context.getAdditionalInformation(JobProperty.EXEC_PLAN_EVENTS);
                    const hasArticleEvent = selectedEvents
                        ? await JobService.getInstance().hasArticleEvent(selectedEvents)
                        : false;

                    if (hasArticleEvent) {
                        const checkChannel = this.checkRequiredProperty(value, ArticleProperty.CHANNEL_ID);
                        if (!checkChannel) {
                            return await this.createValidationResult(ArticleProperty.CHANNEL_ID);
                        }

                        const checkSenderType = this.checkRequiredProperty(value, ArticleProperty.SENDER_TYPE_ID);
                        if (!checkSenderType) {
                            return await this.createValidationResult(ArticleProperty.SENDER_TYPE_ID);
                        }
                    }
                }
            }
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private checkRequiredProperty(value: FormFieldValue, property: string): boolean {
        const propertyValue: FilterCriteria = value.value.find(
            (v: FilterCriteria) => v && v.property && v.property === property
        );
        return propertyValue && this.validateValue(property, propertyValue.value);
    }

    private async createValidationResult(property: string): Promise<ValidationResult> {
        const label = await LabelService.getInstance().getPropertyText(property, KIXObjectType.ARTICLE);
        const errorString = await TranslationService.translate(
            'Translatable#Required field {0} has no value.', [label]
        );
        return new ValidationResult(ValidationSeverity.ERROR, errorString);
    }

    public validateValue(property: string, value: any): boolean {
        if (property === ArticleProperty.CHANNEL_ID || property === ArticleProperty.SENDER_TYPE_ID) {
            return Array.isArray(value) && value.length > 0;
        }

        return true;
    }

    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return false;
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        return new ValidationResult(ValidationSeverity.OK, '');
    }
}
