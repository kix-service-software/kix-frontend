/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export class FAQCategoryFormService extends KIXObjectFormService {

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

    public isServiceFor(objectType: KIXObjectType | string): boolean {
        return objectType === KIXObjectType.FAQ_CATEGORY;
    }

}
