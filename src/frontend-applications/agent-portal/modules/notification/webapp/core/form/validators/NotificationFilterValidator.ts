/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IFormFieldValidator } from '../../../../../../modules/base-components/webapp/core/IFormFieldValidator';
import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { NotificationProperty } from '../../../../model/NotificationProperty';
import { ValidationResult } from '../../../../../../modules/base-components/webapp/core/ValidationResult';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../../model/ContextType';
import { NotificationService } from '../..';
import { ArticleProperty } from '../../../../../ticket/model/ArticleProperty';
import { ValidationSeverity } from '../../../../../../modules/base-components/webapp/core/ValidationSeverity';
import { FormFieldValue } from '../../../../../../model/configuration/FormFieldValue';
import { LabelService } from '../../../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { DynamicField } from '../../../../../dynamic-fields/model/DynamicField';
import { FilterCriteria } from '../../../../../../model/FilterCriteria';

export class NotificationFilterValidator implements IFormFieldValidator {

    public validatorId: string = 'NotificationFilterValidator';

    public isValidatorFor(formField: FormFieldConfiguration): boolean {
        return formField.property === NotificationProperty.FILTER;
    }

    public async validate(formField: FormFieldConfiguration): Promise<ValidationResult> {

        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context.getFormManager().getFormInstance();

        if (
            formInstance.getForm().objectType === KIXObjectType.NOTIFICATION
            && formField.property === NotificationProperty.FILTER
        ) {
            const value = formInstance.getFormFieldValue(formField.instanceId);
            if (value && value.value && Array.isArray(value.value)) {
                let selectedEvents = [];
                let hasArticleEvent = true;
                if (context && context.descriptor.contextType === ContextType.DIALOG) {
                    selectedEvents = context.getAdditionalInformation(NotificationProperty.DATA_EVENTS);
                    hasArticleEvent = selectedEvents
                        ? await NotificationService.getInstance().hasArticleEvent(selectedEvents)
                        : false;
                }

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
