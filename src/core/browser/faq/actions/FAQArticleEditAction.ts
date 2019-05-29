import { AbstractAction, FormInstance, KIXObjectType, ContextMode } from "../../../model";
import { FormService } from "../../form";
import { ContextService } from "../../context";

export class FAQArticleEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-faq-article-form', false);
        ContextService.getInstance().setDialogContext(null, KIXObjectType.FAQ_ARTICLE, ContextMode.EDIT, null, true);
    }

}
