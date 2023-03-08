/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { MailFilterMatch } from './MailFilterMatch';
import { MailFilterSet } from './MailFilterSet';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class MailFilter extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.MAIL_FILTER;

    public ObjectId: string | number;

    public ID: string | number;
    public Name: string;
    public StopAfterMatch: number;
    public Match: MailFilterMatch[];
    public Set: MailFilterSet[];

    public constructor(mailFilter?: MailFilter) {
        super(mailFilter);
        if (mailFilter) {
            this.ID = mailFilter.ID;
            this.ObjectId = this.ID;
            this.Name = mailFilter.Name;
            this.StopAfterMatch = mailFilter.StopAfterMatch;
            this.Match = mailFilter.Match;
            this.Set = mailFilter.Set;
        }
    }

}
