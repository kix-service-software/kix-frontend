/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory, KIXObjectService } from '../kix';
import { FAQArticle, FAQArticleFactory } from '../../model/kix/faq';
import { User, KIXObjectType } from '../../model';

export class FAQArticleBrowserFactory implements IKIXObjectFactory<FAQArticle> {

    private static INSTANCE: FAQArticleBrowserFactory;

    public static getInstance(): FAQArticleBrowserFactory {
        if (!FAQArticleBrowserFactory.INSTANCE) {
            FAQArticleBrowserFactory.INSTANCE = new FAQArticleBrowserFactory();
        }
        return FAQArticleBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(faqArticle: FAQArticle): Promise<FAQArticle> {
        const newFAQArticle = FAQArticleFactory.create(faqArticle);
        await this.mapUserData(newFAQArticle);
        return newFAQArticle;
    }

    private async mapUserData(faqArticle: FAQArticle): Promise<void> {
        const createUsers = await KIXObjectService.loadObjects<User>(
            KIXObjectType.USER, [faqArticle.CreatedBy], null, null, true
        ).catch((error) => [] as User[]);
        faqArticle.createdBy = createUsers && !!createUsers.length ? createUsers[0] : null;
        const changeUsers = await KIXObjectService.loadObjects<User>(
            KIXObjectType.USER, [faqArticle.ChangedBy], null, null, true
        ).catch((error) => [] as User[]);
        faqArticle.changedBy = changeUsers && !!changeUsers.length ? changeUsers[0] : null;
    }
}
