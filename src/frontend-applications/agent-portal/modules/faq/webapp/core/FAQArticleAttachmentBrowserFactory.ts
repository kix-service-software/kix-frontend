/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from '../../../../modules/base-components/webapp/core/IKIXObjectFactory';
import { Attachment } from '../../../../model/kix/Attachment';

export class FAQArticleAttachmentBrowserFactory implements IKIXObjectFactory<Attachment> {

    private static INSTANCE: FAQArticleAttachmentBrowserFactory;

    public static getInstance(): FAQArticleAttachmentBrowserFactory {
        if (!FAQArticleAttachmentBrowserFactory.INSTANCE) {
            FAQArticleAttachmentBrowserFactory.INSTANCE = new FAQArticleAttachmentBrowserFactory();
        }
        return FAQArticleAttachmentBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(attachment: Attachment): Promise<Attachment> {
        const newFAQArticle = new Attachment(attachment);
        return newFAQArticle;
    }

}
