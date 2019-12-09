/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IFormFieldValidator } from "../../../../../../modules/base-components/webapp/core/IFormFieldValidator";
import { FormFieldConfiguration } from "../../../../../../model/configuration/FormFieldConfiguration";
import { NotificationProperty } from "../../../../model/NotificationProperty";
import { ValidationResult } from "../../../../../../modules/base-components/webapp/core/ValidationResult";
import { FormService } from "../../../../../../modules/base-components/webapp/core/FormService";
import { ContextService } from "../../../../../../modules/base-components/webapp/core/ContextService";
import { ContextType } from "../../../../../../model/ContextType";
import { NotificationService } from "../..";
import { ArticleProperty } from "../../../../../ticket/model/ArticleProperty";
import { ValidationSeverity } from "../../../../../../modules/base-components/webapp/core/ValidationSeverity";
import { FormFieldValue } from "../../../../../../model/configuration/FormFieldValue";
import { LabelService } from "../../../../../../modules/base-components/webapp/core/LabelService";
import { KIXObjectType } from "../../../../../../model/kix/KIXObjectType";
import { TranslationService } from "../../../../../../modules/translation/webapp/core/TranslationService";

export class NotificationFilterValidator implements IFormFieldValidator {

    public validatorId: string = 'NotificationFilterValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === NotificationProperty.DATA_FILTER;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {

        if (formField.property === NotificationProperty.DATA_FILTER) {
            const formInstance = await FormService.getInstance().getFormInstance(formId);
            const value = formInstance.getFormFieldValue(formField.instanceId);
            if (value && value.value && Array.isArray(value.value)) {
                let selectedEvents = [];
                let hasArticleEvent = true;
                const context = ContextService.getInstance().getActiveContext();
                if (context && context.getDescriptor().contextType === ContextType.DIALOG) {
                    selectedEvents = context.getAdditionalInformation(NotificationProperty.DATA_EVENTS);
                    hasArticleEvent = selectedEvents
                        ? await NotificationService.getInstance().hasArticleEvent(selectedEvents)
                        : false;
                }

                if (hasArticleEvent) {
                    const checkChannel = await this.checkRequiredProperty(value, ArticleProperty.CHANNEL_ID);
                    if (!checkChannel) {
                        return await this.createValidationResult(ArticleProperty.CHANNEL_ID);
                    }

                    const checkSenderType = await this.checkRequiredProperty(value, ArticleProperty.SENDER_TYPE_ID);
                    if (!checkSenderType) {
                        return await this.createValidationResult(ArticleProperty.SENDER_TYPE_ID);
                    }
                }
            }
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private checkRequiredProperty(value: FormFieldValue, property: string): boolean {
        const propertyValue = value.value.find(
            (v) => v[0].replace('Article::', '').replace('Ticket::', '') === property
        );
        return propertyValue && this.validateValue(property, propertyValue[1]);
    }

    private async createValidationResult(property: string): Promise<ValidationResult> {
        const label = await LabelService.getInstance().getPropertyText(property, KIXObjectType.ARTICLE);
        const errorString = await TranslationService.translate(
            "Translatable#Required field '{0}' has no value.", [label]
        );
        return new ValidationResult(ValidationSeverity.ERROR, errorString);
    }

    public validateValue(property: string, value: any): boolean {
        if (property === ArticleProperty.CHANNEL_ID || property === ArticleProperty.SENDER_TYPE_ID) {
            return Array.isArray(value) && value.length > 0;
        }

        return true;
    }
}
