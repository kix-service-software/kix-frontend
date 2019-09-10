/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    User, KIXObjectType, UserProperty, PersonalSettingsProperty, Notification, KIXObjectLoadingOptions,
    FilterCriteria, FilterDataType, KIXObjectProperty, FilterType, NotificationProperty
} from "../../model";
import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectService } from "../kix";
import { SearchOperator } from "../SearchOperator";

export class UserFormService extends KIXObjectFormService<User> {

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

    public isServiceFor(kixObjectType: KIXObjectType) {
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

}
