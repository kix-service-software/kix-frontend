/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../../../../modules/base-components/webapp/core/KIXObjectFormService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { AgentService } from ".";
import { PersonalSettingsProperty } from "../../model/PersonalSettingsProperty";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { NotificationProperty } from "../../../notification/model/NotificationProperty";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { KIXObjectService } from "../../../base-components/webapp/core/KIXObjectService";
import { Notification } from "../../../notification/model/Notification";

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

        if (property === PersonalSettingsProperty.MY_QUEUES && value && typeof value === 'string') {
            value = value.split(',').map((v) => Number(v));
        } else if (property === PersonalSettingsProperty.NOTIFICATIONS) {
            value = await this.handleNotifications(value);
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

    public async postPrepareValues(parameter: Array<[string, any]>): Promise<Array<[string, any]>> {

        const queuesParameter = parameter.find((p) => p[0] === PersonalSettingsProperty.MY_QUEUES);
        if (queuesParameter) {
            queuesParameter[1] = Array.isArray(queuesParameter[1]) ? queuesParameter[1].join(',') : '';
        }

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

        return parameter;
    }
}
