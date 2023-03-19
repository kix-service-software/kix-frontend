/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FAQArticle } from './FAQArticle';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class FAQCategory extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.FAQ_CATEGORY;

    public ID: number;
    public Name: string;
    public Comment: string;
    public ParentID: number;
    public GroupIDs: number[];
    public Fullname: string;
    public ValidID: number;
    public CreateBy: number;
    public CreateTime: string;
    public ChangeBy: number;
    public ChangeTime: string;

    public SubCategories: FAQCategory[];
    public Articles: FAQArticle[] | number[];

    public constructor(faqCategory: FAQCategory) {
        super();
        if (faqCategory) {
            this.ID = faqCategory.ID;
            this.ObjectId = this.ID;
            this.Name = faqCategory.Name;
            this.Comment = faqCategory.Comment;
            this.ParentID = faqCategory.ParentID;
            this.GroupIDs = faqCategory.GroupIDs;
            this.Fullname = faqCategory.Fullname;
            this.ValidID = faqCategory.ValidID;
            this.CreateBy = faqCategory.CreateBy;
            this.CreateTime = faqCategory.CreateTime;
            this.ChangeBy = faqCategory.ChangeBy;
            this.ChangeTime = faqCategory.ChangeTime;
            this.SubCategories = faqCategory.SubCategories
                ? faqCategory.SubCategories.map((sc) => new FAQCategory(sc))
                : [];
            this.Articles = faqCategory.Articles;
        }
    }

    public equals(faqCategory: FAQCategory): boolean {
        return this.ID === faqCategory.ID;
    }


}
