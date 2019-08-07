/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import {
    KIXObjectType, Notification, NotificationProperty, FormField, Form, FormFieldValue,
    FormFieldOption, FormContext, NotificationMessage
} from "../../model";
import { FormGroup } from "../../model/components/form/FormGroup";
import { ServiceRegistry } from "../kix";
import { TranslationService } from "../i18n/TranslationService";

export class NotificationFormService extends KIXObjectFormService<Notification> {

    private static INSTANCE: NotificationFormService = null;

    public static getInstance(): NotificationFormService {
        if (!NotificationFormService.INSTANCE) {
            NotificationFormService.INSTANCE = new NotificationFormService();
        }

        return NotificationFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.NOTIFICATION;
    }

    protected async additionalPreparations(
        form: Form, formFieldValues: Map<string, FormFieldValue<any>>, notification: Notification
    ): Promise<void> {
        if (form) {
            const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
                KIXObjectType.TRANSLATION_PATTERN
            );
            const languages = await translationService.getLanguages();
            const languageFields: FormField[] = [];
            if (languages) {
                languages.forEach((l) => {
                    const languagField = this.getLanguageField(form, l);
                    languageFields.push(languagField);

                    if (
                        form.formContext === FormContext.EDIT &&
                        notification && notification.Message && notification.Message[l[0]]
                    ) {
                        this.setTextValue(languagField.children, formFieldValues, notification.Message[l[0]]);
                    }
                });
            }
            if (!!languageFields.length) {
                form.groups.push(
                    new FormGroup('Translatable#Notification Text', languageFields)
                );
            }
        }
    }

    protected async getValue(
        property: string, value: any, notification: Notification, formField: FormField
    ): Promise<any> {
        switch (property) {
            case NotificationProperty.DATA_FILTER:
                if (notification.Filter) {
                    value = [];
                    notification.Filter.forEach((v, k) => {
                        value.push([k, v]);
                    });
                }
                break;
            default:
        }
        return value;
    }

    public async hasPermissions(field: FormField): Promise<boolean> {
        let hasPermissions = true;
        switch (field.property) {
            case NotificationProperty.DATA_RECIPIENT_AGENTS:
                hasPermissions = await this.checkPermissions('system/users');
                break;
            case NotificationProperty.DATA_RECIPIENT_ROLES:
                hasPermissions = await this.checkPermissions('system/roles');
                break;
            default:
        }
        return hasPermissions;
    }

    private getLanguageField(form: Form, language: [string, string]): FormField {
        const subjectField = new FormField(
            'Translatable#Subject', `${NotificationProperty.MESSAGE_SUBJECT}###${language[0]}`, null, true,
            form && form.formContext === FormContext.EDIT ?
                'Translatable#Helptext_Admin_NotificationEdit_MessageSubject' :
                'Translatable#Helptext_Admin_NotificationCreate_MessageSubject'
        );
        const bodyField = new FormField(
            'Translatable#Text', `${NotificationProperty.MESSAGE_BODY}###${language[0]}`, 'rich-text-input', true,
            form && form.formContext === FormContext.EDIT ?
                'Translatable#Helptext_Admin_NotificationEdit_MessageText' :
                'Translatable#Helptext_Admin_NotificationCreate_MessageText',
            [new FormFieldOption('NO_IMAGES', true)]
        );
        const languagField = new FormField(
            language[1], null, null, null, null, null, null, [subjectField, bodyField],
            undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            true, true
        );
        return languagField;
    }

    private setTextValue(
        fields: FormField[], formFieldValues: Map<string, FormFieldValue<any>>, message: NotificationMessage
    ): void {
        let subjectValue;
        let bodyValue;
        if (message) {
            if (message.Subject) {
                subjectValue = new FormFieldValue(message.Subject);
            }
            if (message.Body) {
                bodyValue = new FormFieldValue(message.Body);
            }
        }
        if (subjectValue) {
            formFieldValues.set(fields[0].instanceId, subjectValue);
        }
        if (bodyValue) {
            formFieldValues.set(fields[1].instanceId, bodyValue);
        }
    }
}
