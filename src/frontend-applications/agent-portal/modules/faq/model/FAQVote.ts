/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class FAQVote extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.FAQ_VOTE;

    public ID: number;
    public ArticleID: number;
    public CreatedBy: string;
    public IPAddress: string;
    public Interface: string;
    public Rating: number;
    public Created: string;

    public constructor(faqVote?: FAQVote) {
        super();
        if (faqVote) {
            this.ID = Number(faqVote.ID);
            this.ObjectId = this.ID;
            this.ArticleID = faqVote.ArticleID;
            this.IPAddress = faqVote.IPAddress;
            this.Interface = faqVote.Interface;
            this.Rating = Number(faqVote.Rating);
            this.CreatedBy = faqVote.CreatedBy;
            this.Created = faqVote.Created;
        }
    }

    public equals(faqVote: FAQVote): boolean {
        return this.ID === faqVote.ID;
    }

    public toString(): string {
        return this.Rating.toString();
    }

}
