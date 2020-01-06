/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from "../../../../modules/base-components/webapp/core/IKIXObjectFactory";
import { FAQCategory } from "../../model/FAQCategory";

export class FAQCategoryBrowserFactory implements IKIXObjectFactory<FAQCategory> {

    private static INSTANCE: FAQCategoryBrowserFactory;

    public static getInstance(): FAQCategoryBrowserFactory {
        if (!FAQCategoryBrowserFactory.INSTANCE) {
            FAQCategoryBrowserFactory.INSTANCE = new FAQCategoryBrowserFactory();
        }
        return FAQCategoryBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(faqCategory: FAQCategory): Promise<FAQCategory> {
        const newFAQCategory = new FAQCategory(faqCategory);
        return newFAQCategory;
    }

}
