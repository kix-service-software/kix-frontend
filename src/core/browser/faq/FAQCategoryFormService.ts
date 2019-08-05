/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType } from "../../model";
import { FAQCategory } from "../../model/kix/faq";

export class FAQCategoryFormService extends KIXObjectFormService<FAQCategory> {

    private static INSTANCE: FAQCategoryFormService;

    public static getInstance(): FAQCategoryFormService {
        if (!FAQCategoryFormService.INSTANCE) {
            FAQCategoryFormService.INSTANCE = new FAQCategoryFormService();
        }
        return FAQCategoryFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.FAQ_CATEGORY;
    }

}
