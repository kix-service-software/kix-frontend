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
    KIXObjectType, Notification, NotificationProperty, FormField, Form, FormFieldValue, FormFieldOption
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
                    // TODO: get relevant value for edit mode
                    // const subjectValue = this.getDefaultValue(l, NotificationProperty.MESSAGE_SUBJECT);
                    // const bodyValue = this.getDefaultValue(l, NotificationProperty.MESSAGE_BODY);
                    const subjectField = new FormField(
                        'Translatable#Subject', `${NotificationProperty.MESSAGE_SUBJECT}###${l[0]}`, null, true,
                        'Translatable#Helptext_Admin_NotificationCreate_MessageSubject'
                    );
                    const bodyField = new FormField(
                        'Translatable#Text', `${NotificationProperty.MESSAGE_BODY}###${l[0]}`, 'rich-text-input', true,
                        'Translatable#Helptext_Admin_NotificationCreate_MessageText', [
                            new FormFieldOption('NO_IMAGES', true)
                        ]
                    );
                    const languagField = new FormField(
                        l[1], null, null, null, null, null, null, [subjectField, bodyField],
                        undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                        true, true
                    );
                    languageFields.push(languagField);
                });
            }
            if (!!languageFields.length) {
                form.groups.push(
                    new FormGroup('Translatable#Notification Text', languageFields)
                );
            }
        }
    }

    protected async getValue(property: string, value: any, notification: Notification): Promise<any> {
        switch (property) {
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

}
