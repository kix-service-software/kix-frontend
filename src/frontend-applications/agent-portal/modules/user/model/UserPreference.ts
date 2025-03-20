/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class UserPreference extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.PERSONAL_SETTINGS;

    public UserID: number;
    public ID: string;
    public Value: string;

    public constructor(userPreference?: UserPreference) {
        super();
        if (userPreference) {
            this.UserID = Number(userPreference.UserID);
            this.ID = userPreference.ID;
            this.ObjectId = this.ID;
            this.Value = userPreference.Value === ''
                ? null
                : userPreference.Value;
        }
    }

    public equals(userPreference: UserPreference): boolean {
        return userPreference.UserID === this.UserID && userPreference.ID === this.ID;
    }
}
