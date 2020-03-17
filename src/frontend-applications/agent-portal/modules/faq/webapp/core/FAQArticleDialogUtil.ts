/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FAQDetailsContext } from "./context/FAQDetailsContext";
import { NewFAQArticleDialogContext, EditFAQArticleDialogContext } from "./context";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ContextMode } from "../../../../model/ContextMode";

export class FAQArticleDialogUtil {

    public static async create(): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewFAQArticleDialogContext.CONTEXT_ID, KIXObjectType.FAQ_ARTICLE, ContextMode.CREATE
        );
    }

    public static async edit(faqArticleId?: string | number): Promise<void> {
        if (!faqArticleId) {
            const context = await ContextService.getInstance().getContext<FAQDetailsContext>(
                FAQDetailsContext.CONTEXT_ID
            );

            if (context) {
                faqArticleId = context.getObjectId();
            }
        }

        if (faqArticleId) {
            ContextService.getInstance().setDialogContext(
                EditFAQArticleDialogContext.CONTEXT_ID, KIXObjectType.FAQ_ARTICLE, ContextMode.EDIT, faqArticleId
            );
        }
    }

}
