/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class FAQHistory extends KIXObject<FAQHistory> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE_HISTORY;

    public ID: number;
    public ArticleID: number;
    public Name: string;
    public CreatedBy: number;
    public Created: string;

    public constructor(faqHistory: FAQHistory) {
        super();
        if (faqHistory) {
            this.ID = faqHistory.ID;
            this.ObjectId = this.ID;
            this.ArticleID = faqHistory.ArticleID;
            this.Name = faqHistory.Name;
            this.Created = faqHistory.Created;
            this.CreatedBy = faqHistory.CreatedBy;
        }
    }

    public equals(faqHistory: FAQHistory): boolean {
        return this.ID === faqHistory.ID;
    }


}
