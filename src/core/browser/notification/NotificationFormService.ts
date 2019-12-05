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
    KIXObjectType, Notification, NotificationProperty, FormFieldValue,
    FormFieldOption, FormContext, NotificationMessage, ContextType, ArticleProperty
} from "../../model";
import { ServiceRegistry } from "../kix";
import { TranslationService } from "../i18n/TranslationService";
import {
    FormConfiguration, FormFieldConfiguration, FormGroupConfiguration
} from "../../model/components/form/configuration";
import { ContextService } from "../context";
import { NotificationService } from "./NotificationService";

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

    protected async prePrepareForm(form: FormConfiguration, notification: Notification): Promise<void> {
        if (notification && notification.Events) {
            const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
            if (context) {
                context.setAdditionalInformation(
                    NotificationProperty.DATA_EVENTS, notification.Events
                );
            }
        }
    }

    protected async postPrepareForm(
        form: FormConfiguration, formFieldValues: Map<string, FormFieldValue<any>>, notification: Notification
    ): Promise<void> {
        if (form) {
            const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
                KIXObjectType.TRANSLATION_PATTERN
            );
            const languages = await translationService.getLanguages();
            const languageFields: FormFieldConfiguration[] = [];
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
                form.pages[form.pages.length - 1].groups.push(
                    new FormGroupConfiguration(
                        'notification-form-text', 'Translatable#Notification Text', [], null, languageFields
                    )
                );
            }
        }
    }

    protected async getValue(
        property: string, value: any, notification: Notification, formField: FormFieldConfiguration
    ): Promise<any> {
        switch (property) {
            case NotificationProperty.DATA_FILTER:
                if (notification.Filter) {
                    const articleProperty = [
                        ArticleProperty.SENDER_TYPE_ID, ArticleProperty.CHANNEL_ID, ArticleProperty.TO,
                        ArticleProperty.CC, ArticleProperty.FROM, ArticleProperty.SUBJECT, ArticleProperty.BODY
                    ];
                    let hasArticleEvent = false;
                    value = [];
                    const context = ContextService.getInstance().getActiveContext();
                    if (context && context.getDescriptor().contextType === ContextType.DIALOG) {
                        const selectedEvents = context.getAdditionalInformation(NotificationProperty.DATA_EVENTS);
                        hasArticleEvent = selectedEvents
                            ? await NotificationService.getInstance().hasArticleEvent(selectedEvents)
                            : false;
                    }

                    notification.Filter.forEach((v, k) => {
                        if (hasArticleEvent || !articleProperty.some((p) => k === p)) {
                            value.push([k, v]);
                        }
                    });
                }
                break;
            default:
        }
        return value;
    }

    public async hasPermissions(field: FormFieldConfiguration): Promise<boolean> {
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

    private getLanguageField(form: FormConfiguration, language: [string, string]): FormFieldConfiguration {
        const subjectField = new FormFieldConfiguration(
            'subject-field',
            'Translatable#Subject', `${NotificationProperty.MESSAGE_SUBJECT}###${language[0]}`, null, true,
            form && form.formContext === FormContext.EDIT ?
                'Translatable#Helptext_Admin_NotificationEdit_MessageSubject' :
                'Translatable#Helptext_Admin_NotificationCreate_MessageSubject'
        );
        const bodyField = new FormFieldConfiguration(
            'body-field',
            'Translatable#Text', `${NotificationProperty.MESSAGE_BODY}###${language[0]}`, 'rich-text-input', true,
            form && form.formContext === FormContext.EDIT ?
                'Translatable#Helptext_Admin_NotificationEdit_MessageText' :
                'Translatable#Helptext_Admin_NotificationCreate_MessageText',
            [new FormFieldOption('NO_IMAGES', true)]
        );
        const languagField = new FormFieldConfiguration(
            'language-field',
            language[1], null, null, null, null, null, null, null, [subjectField, bodyField],
            undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            true, true
        );
        return languagField;
    }

    private setTextValue(
        fields: FormFieldConfiguration[], formFieldValues: Map<string, FormFieldValue<any>>,
        message: NotificationMessage
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
