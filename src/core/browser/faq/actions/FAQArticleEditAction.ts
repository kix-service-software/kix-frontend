import { AbstractAction, FormInstance, KIXObjectType, ContextMode } from "../../../model";
import { FormService } from "../../form";
import { ContextService } from "../../context";

export class FAQArticleEditAction extends AbstractAction {

    public initAction(): void {
        this.text = "Bearbeiten";
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-faq-article-form', false);
        ContextService.getInstance().setDialogContext(null, KIXObjectType.FAQ_ARTICLE, ContextMode.EDIT);
    }

}
