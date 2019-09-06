/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType, PersonalSettingsProperty } from "../../model";
import { AgentService } from "../application/AgentService";

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
        } else if (property === PersonalSettingsProperty.NOTIFICATIONS && value) {
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
}
