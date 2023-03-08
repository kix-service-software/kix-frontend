/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DefaultSelectInputFormOption } from '../../../../model/configuration/DefaultSelectInputFormOption';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { NotificationConfig } from '../../model/NotificationConfig';
import { NotificationProperty } from '../../model/NotificationProperty';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormContext } from '../../../../model/configuration/FormContext';
import { FormGroupConfiguration } from '../../../../model/configuration/FormGroupConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { NotificationMessage } from '../../model/NotificationMessage';
import { Notification } from '../../model/Notification';
import { IdService } from '../../../../model/IdService';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';

export class NotificationFormService extends KIXObjectFormService {

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

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.NOTIFICATION;
    }

    protected async prePrepareForm(form: FormConfiguration, notification?: Notification): Promise<void> {
        if (notification && notification.Events) {
            const context = ContextService.getInstance().getActiveContext();
            if (context) {
                context.setAdditionalInformation(
                    NotificationProperty.DATA_EVENTS, notification.Events
                );
            }
        }
    }

    protected async postPrepareForm(
        form: FormConfiguration, formInstance: FormInstance,
        formFieldValues: Map<string, FormFieldValue<any>>, notification: Notification
    ): Promise<void> {
        if (form) {
            const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
                KIXObjectType.TRANSLATION_PATTERN
            );
            const languages = await translationService.getLanguages();
            const languageFields: FormFieldConfiguration[] = [];
            if (languages) {
                languages.forEach((l) => {
                    const languagField = this.getLanguageField(form, l, notification);
                    languageFields.push(languagField);

                    if (
                        form.formContext === FormContext.EDIT &&
                        notification && notification.Message && notification.Message[l[0]]
                    ) {
                        this.setTextValue(
                            languagField.children, formInstance, formFieldValues, notification.Message[l[0]]
                        );
                    }
                });
            }
            if (languageFields.length) {
                form.pages[form.pages.length - 1].groups.push(
                    new FormGroupConfiguration(
                        'notification-form-text', 'Translatable#Notification Text', [], null, languageFields
                    )
                );
            }
        }
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

    private getLanguageField(
        form: FormConfiguration, language: [string, string], notification: Notification
    ): FormFieldConfiguration {
        let contentType = 'text/html';
        if (
            form.formContext === FormContext.EDIT &&
            notification && notification.Message && notification.Message[language[0]]
        ) {
            contentType = notification.Message[language[0]].ContentType;
        }
        const subjectField = new FormFieldConfiguration(
            'subject-field',
            'Translatable#Subject', `${NotificationProperty.MESSAGE_SUBJECT}###${language[0]}`, null, true,
            form && form.formContext === FormContext.EDIT ?
                'Translatable#Helptext_Admin_NotificationEdit_MessageSubject' :
                'Translatable#Helptext_Admin_NotificationCreate_MessageSubject'
        );
        subjectField.instanceId = IdService.generateDateBasedId(`notification-${language[0]}`);
        const contentTypeField = new FormFieldConfiguration(
            'contentType-field',
            'Translatable#ContentType', `${NotificationProperty.MESSAGE_CONTENTTYPE}###${language[0]}`, 'default-select-input', true,
            form && form.formContext === FormContext.EDIT ?
                'Translatable#Helptext_Admin_NotificationEdit_MessageContentType' :
                'Translatable#Helptext_Admin_NotificationCreate_MessageContentType',
                [
                    new FormFieldOption(
                        DefaultSelectInputFormOption.NODES,
                        NotificationConfig.getContentType().map((v) => new TreeNode(v.key, v.label))
                    )
                ],
                new FormFieldValue('text/html')
        );
        contentTypeField.instanceId = IdService.generateDateBasedId(`notification-${language[0]}`);

        const languagField = new FormFieldConfiguration(
            'language-field',
            language[1], null, null, null, null, null, null, null, [subjectField, contentTypeField],
            undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            true, true
        );
        languagField.instanceId = IdService.generateDateBasedId(`notification-${language[0]}`);
        return languagField;
    }

    private async setTextValue(
        fields: FormFieldConfiguration[], formInstance: FormInstance, formFieldValues: Map<string, FormFieldValue<any>>,
        message: NotificationMessage
    ): Promise<void> {
        let subjectValue;
        let contentTypeValue;
        let bodyValue;
        if (message) {
            if (message.Subject) {
                subjectValue = new FormFieldValue(message.Subject);
            }
            if (message.ContentType) {
                contentTypeValue = new FormFieldValue(message.ContentType);
            }
            if (message.Body) {
                bodyValue = new FormFieldValue(message.Body);
            }
        }
        if (subjectValue) {
            formFieldValues.set(fields[0].instanceId, subjectValue);
        }
        if (contentTypeValue) {
            formFieldValues.set(fields[1].instanceId, contentTypeValue);

            const contentTypeFields = await this.getFormFieldsForContentType(
                formInstance, fields[1], contentTypeValue.value, formInstance.getForm().id, true
            );
            formInstance.addFieldChildren(fields[1], contentTypeFields, true);
            if (bodyValue) {
                formFieldValues.set(contentTypeFields[0].instanceId, bodyValue);
            }
        }
    }

    public async getFormFieldsForContentType(
        formInstance: FormInstance, field: FormFieldConfiguration, contentType: string,
        formId: string, clear: boolean = false
    ): Promise<FormFieldConfiguration[]> {
        let fields: FormFieldConfiguration[] = [];

        const fieldRegEx = new RegExp(`^${NotificationProperty.MESSAGE_CONTENTTYPE}###(.+)$`);

        let fieldPromises = [];
        if (field.property.match(fieldRegEx)) {
            const language = field.property.replace(fieldRegEx, '$1');
            if (contentType === 'text/html') {
                fieldPromises = [
                    this.getRichtextBodyField(formInstance, language, clear)
                ];

            } else if (contentType === 'text/plain') {
                fieldPromises = [
                    this.getPlainBodyField(formInstance, language, clear)
                ];
            }
        }

        await Promise.all(fieldPromises).then((newFields: FormFieldConfiguration[]) => {
            fields = newFields.filter((nf) => typeof nf !== 'undefined' && nf !== null);
        });

        return fields;
    }

    private async getRichtextBodyField(
        formInstance: FormInstance, language: string, clear: boolean
    ): Promise<FormFieldConfiguration> {
        let bodyField = new FormFieldConfiguration(
            'body-field',
            'Translatable#Text', `${NotificationProperty.MESSAGE_BODY}###${language}`, 'rich-text-input', true,
            formInstance.getFormContext() === FormContext.EDIT ?
                'Translatable#Helptext_Admin_NotificationEdit_MessageText' :
                'Translatable#Helptext_Admin_NotificationCreate_MessageText',
            [new FormFieldOption('NO_IMAGES', true)]
        );
        if (!clear && formInstance) {
            const existingField = formInstance.getFormFieldByProperty(`${NotificationProperty.MESSAGE_BODY}###${language}`);
            if (existingField) {
                bodyField = existingField;
                const value = formInstance.getFormFieldValue<string>(existingField.instanceId);
                if (value) {
                    bodyField.defaultValue = value;
                }
            }
        }
        return bodyField;
    }

    private async getPlainBodyField(
        formInstance: FormInstance, language: string, clear: boolean
    ): Promise<FormFieldConfiguration> {
        let bodyField = new FormFieldConfiguration(
            'body-field',
            'Translatable#Text', `${NotificationProperty.MESSAGE_BODY}###${language}`, 'text-area-input', true,
            formInstance.getFormContext() === FormContext.EDIT ?
                'Translatable#Helptext_Admin_NotificationEdit_MessageText' :
                'Translatable#Helptext_Admin_NotificationCreate_MessageText',
            [new FormFieldOption('NO_IMAGES', true)]
        );
        if (!clear && formInstance) {
            const existingField = formInstance.getFormFieldByProperty(`${NotificationProperty.MESSAGE_BODY}###${language}`);
            if (existingField) {
                bodyField = existingField;
                const value = formInstance.getFormFieldValue<string>(existingField.instanceId);
                if (value) {
                    bodyField.defaultValue = value;
                }
            }
        }
        return bodyField;
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        switch (property) {
            case NotificationProperty.DATA_VISIBLE_FOR_AGENT:
            case NotificationProperty.DATA_SEND_ONCE_A_DAY:
            case NotificationProperty.DATA_SEND_DESPITE_OOO:
            case NotificationProperty.DATA_RECIPIENT_SUBJECT:
            case NotificationProperty.DATA_CREATE_ARTICLE:
                value = Number(value);
                break;
            case NotificationProperty.DATA_RECIPIENT_EMAIL:
                value = Array.isArray(value) ? value.join(',') : value;
                break;
            default:

        }
        return [[property, value]];
    }

    public async preparePredefinedValues(forUpdate: boolean): Promise<Array<[string, any]>> {
        return [
            ['Transports', ['Email']]
        ];
    }
}
