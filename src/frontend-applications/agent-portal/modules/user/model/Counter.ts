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

export class Counter extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: string = KIXObjectType.USER_COUNTER;

    public Ticket: TicketCounter = new TicketCounter();

    public constructor(counter?: Counter) {
        super(counter);
        if (counter?.Ticket) {
            this.Ticket = new TicketCounter(counter.Ticket);
        }
    }

}

class TicketCounter {
    public Owned: number = 0;
    public OwnedAndUnseen: number = 0;
    public OwnedAndLocked: number = 0;
    public OwnedAndLockedAndUnseen: number = 0;
    public Watched: number = 0;
    public WatchedAndUnseen: number = 0;

    public constructor(counter?: TicketCounter) {
        this.Owned = counter?.Owned || 0;
        this.OwnedAndUnseen = counter?.OwnedAndUnseen || 0;
        this.OwnedAndLocked = counter?.OwnedAndLocked || 0;
        this.OwnedAndLockedAndUnseen = counter?.OwnedAndLockedAndUnseen || 0;
        this.Watched = counter?.Watched || 0;
        this.WatchedAndUnseen = counter?.WatchedAndUnseen || 0;
    }
}
