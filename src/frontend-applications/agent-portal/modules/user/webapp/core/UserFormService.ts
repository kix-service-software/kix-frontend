/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../../../../modules/base-components/webapp/core/KIXObjectFormService";
import { User } from "../../model/User";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { UserProperty } from "../../model/UserProperty";
import { PersonalSettingsProperty } from "../../model/PersonalSettingsProperty";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { KIXObjectService } from "../../../../modules/base-components/webapp/core/KIXObjectService";
import { NotificationProperty } from "../../../notification/model/NotificationProperty";
import { Notification } from "../../../notification/model/Notification";

export class UserFormService extends KIXObjectFormService {

    private static INSTANCE: UserFormService = null;

    public static getInstance(): UserFormService {
        if (!UserFormService.INSTANCE) {
            UserFormService.INSTANCE = new UserFormService();
        }

        return UserFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType | string) {
        return kixObjectType === KIXObjectType.USER;
    }

    protected async getValue(property: string, value: any, user: User): Promise<any> {
        switch (property) {
            case UserProperty.ROLEIDS:
                if (!value) {
                    value = [];
                }
                break;
            case PersonalSettingsProperty.MY_QUEUES:
                if (user && user.Preferences) {
                    const myQueues = user.Preferences.find((p) => p.ID === PersonalSettingsProperty.MY_QUEUES);
                    if (myQueues && myQueues.Value) {
                        value = myQueues.Value.split(',').map((v) => Number(v));
                    }
                }
                break;
            case PersonalSettingsProperty.USER_LANGUAGE:
                if (user && user.Preferences) {
                    const languagePreference = user.Preferences.find(
                        (p) => p.ID === PersonalSettingsProperty.USER_LANGUAGE
                    );
                    value = languagePreference ? languagePreference.Value : null;
                }
                break;
            case PersonalSettingsProperty.NOTIFICATIONS:
                if (user && user.Preferences) {
                    const notificationPreference = user.Preferences.find(
                        (p) => p.ID === PersonalSettingsProperty.NOTIFICATIONS
                    );
                    const prefValue = notificationPreference ? notificationPreference.Value : null;
                    if (prefValue) {
                        try {
                            const notifications = JSON.parse(prefValue);
                            value = [];
                            for (const key in notifications) {
                                if (notifications[key]) {
                                    value.push(Number(key.split('-')[1]));
                                }
                            }
                        } catch (e) {
                            console.warn('Could not read/parse notification preference value.');
                        }
                    }
                } else {
                    const loadingOptions = new KIXObjectLoadingOptions([
                        new FilterCriteria(
                            'Data.' + NotificationProperty.DATA_VISIBLE_FOR_AGENT, SearchOperator.EQUALS,
                            FilterDataType.STRING, FilterType.AND, 1
                        ),
                        new FilterCriteria(
                            KIXObjectProperty.VALID_ID, SearchOperator.EQUALS,
                            FilterDataType.NUMERIC, FilterType.AND, 1
                        )
                    ]);
                    const notifications = await KIXObjectService.loadObjects<Notification>(
                        KIXObjectType.NOTIFICATION, null, loadingOptions
                    );
                    if (notifications) {
                        value = notifications.map((n) => n.ID);
                    }
                }
                break;
            default:
        }
        return value;
    }

    public async prepareFormFields(formId: string, forUpdate: boolean = false): Promise<Array<[string, any]>> {
        const parameter = await super.prepareFormFields(formId, forUpdate);

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
