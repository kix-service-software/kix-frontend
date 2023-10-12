/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class StateType extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET_STATE_TYPE;

    public ObjectId: string | number;

    public ID: number;

    public Name: string;

    public constructor(stateType?: StateType) {
        super();
        if (stateType) {
            this.ID = Number(stateType.ID);
            this.ObjectId = this.ID;
            this.Name = stateType.Name;
            this.ValidID = 1;
        }
    }

    public equals(stateType: StateType): boolean {
        return this.ID === stateType.ID;
    }

}
