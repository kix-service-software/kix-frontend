/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
