/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { User, KIXObjectType, UserProperty, PersonalSettingsProperty } from "../../model";
import { KIXObjectFormService } from "../kix/KIXObjectFormService";

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
            default:
        }
        return value;
    }

}
