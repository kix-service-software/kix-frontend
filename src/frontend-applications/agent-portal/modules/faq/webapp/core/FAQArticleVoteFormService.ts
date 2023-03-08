/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { KIXObjectFormService } from '../../../base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export class FAQArticleVoteFormService extends KIXObjectFormService {

    private static INSTANCE: FAQArticleVoteFormService;

    public static getInstance(): FAQArticleVoteFormService {
        if (!FAQArticleVoteFormService.INSTANCE) {
            FAQArticleVoteFormService.INSTANCE = new FAQArticleVoteFormService();
        }
        return FAQArticleVoteFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: string): boolean {
        return objectType === KIXObjectType.FAQ_VOTE;
    }

}
