import { NewFAQArticleDialogContext, EditFAQArticleDialogContext } from "./context";
import { KIXObjectType, ContextMode } from "../../model";
import { ContextService } from "../context";
import { FAQDetailsContext } from "./context/FAQDetailsContext";

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
