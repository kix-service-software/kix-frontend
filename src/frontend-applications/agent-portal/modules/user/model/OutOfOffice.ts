/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { OutOfOfficeProperty } from './OutOfOfficeProperty';
import { User } from '../model/User';

export class OutOfOffice {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.USER_PREFERENCE;

    public Start: Date | string = null;

    public End: Date | string = null;

    public Substitute: User = null;

    public Properties: string[] = [];

    public constructor(
        outOfOffice?: OutOfOffice, start?: Date | string, end?: Date | string, substitute?: User
    ) {

        if (outOfOffice) {
            this.Start = outOfOffice.Start;
            this.End = outOfOffice.End;
            this.Substitute = outOfOffice.Substitute;
        }
        else {
            this.Start = start;
            this.End = end;
            this.Substitute = substitute;
        }
        this.Properties = [
            OutOfOfficeProperty.START,
            OutOfOfficeProperty.END,
            OutOfOfficeProperty.SUBSTITUTE
        ];
    }
}