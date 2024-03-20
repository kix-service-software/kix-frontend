/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormContext } from '../../../../model/configuration/FormContext';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { DateTimeUtil } from '../../../base-components/webapp/core/DateTimeUtil';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { PersonalSettingsProperty } from '../../model/PersonalSettingsProperty';
import { AgentService } from './AgentService';

export class PersonalSettingsFormService extends KIXObjectFormService {

    private static INSTANCE: PersonalSettingsFormService;

    public static getInstance(): PersonalSettingsFormService {
        if (!PersonalSettingsFormService.INSTANCE) {
            PersonalSettingsFormService.INSTANCE = new PersonalSettingsFormService();
        }
        return PersonalSettingsFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.PERSONAL_SETTINGS;
    }

    protected async getValue(property: string, value: any): Promise<any> {
        const user = await AgentService.getInstance().getCurrentUser();
        const preference = user.Preferences ? user.Preferences.find((p) => p.ID === property) : null;

        value = preference ? preference.Value : value;

        switch (property) {
            case PersonalSettingsProperty.MY_QUEUES:
                if (value && typeof value === 'string') {
                    value = value.split(',').map((v) => Number(v));
                }
                break;
            case PersonalSettingsProperty.NOTIFICATIONS:
                value = await this.handleNotifications(value);
                break;
            case PersonalSettingsProperty.DONT_ASK_DIALOG_ON_CLOSE:
                value = Boolean(Number(value));
                break;
            case PersonalSettingsProperty.OUT_OF_OFFICE_START:
            case PersonalSettingsProperty.OUT_OF_OFFICE_END:
                if (value) {
                    value = DateTimeUtil.getKIXDateString(value);
                }
                break;
            default:
                break;
        }

        return value;
    }

    public async handleNotifications(value: any): Promise<any> {
        if (value) {
            try {
                const notifications = JSON.parse(value);
                value = [];
                for (const key in notifications) {
                    if (notifications[key]) {
                        value.push(Number(key.split('-')[1]));
                    }
                }
            } catch (e) {
                console.warn('Could not load/parse notification preference.');
            }
        }
        return value;
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        formContext?: FormContext, formInstance?: FormInstance
    ): Promise<Array<[string, any]>> {

        const notificationParameter = parameter.find((p) => p[0] === PersonalSettingsProperty.NOTIFICATIONS);
        if (notificationParameter) {
            const transport = 'Email';
            const notificationPreference = {};
            if (Array.isArray(notificationParameter[1])) {
                notificationParameter[1].forEach((e) => {
                    const eventKey = `Notification-${e}-${transport}`;
                    notificationPreference[eventKey] = 1;
                });

            }

            notificationParameter[1] = JSON.stringify(notificationPreference);
        }

        const dontAskValue = parameter.find((p) => p[0] === PersonalSettingsProperty.DONT_ASK_DIALOG_ON_CLOSE);
        if (dontAskValue) {
            dontAskValue[1] = Number(dontAskValue[1]);
        }

        const outOfOfficeStartParameter = parameter.find(
            (p) => p[0] === PersonalSettingsProperty.OUT_OF_OFFICE_START
        );
        if (outOfOfficeStartParameter) {
            outOfOfficeStartParameter[1] = outOfOfficeStartParameter[1]
                ? DateTimeUtil.getKIXDateString(outOfOfficeStartParameter[1])
                : '';
        }
        const outOfOfficeEndParameter = parameter.find(
            (p) => p[0] === PersonalSettingsProperty.OUT_OF_OFFICE_END
        );
        if (outOfOfficeEndParameter) {
            outOfOfficeEndParameter[1] = outOfOfficeEndParameter[1]
                ? DateTimeUtil.getKIXDateString(outOfOfficeEndParameter[1])
                : '';
        }

        return super.postPrepareValues(parameter, createOptions, formContext, formInstance);
    }
}
