import { AbstractAction, FormInstance, KIXObjectType, ContextMode, CRUD } from "../../../model";
import { FormService } from "../../form";
import { ContextService } from "../../context";
import { UIComponentPermission } from "../../../model/UIComponentPermission";

export class FAQArticleEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('faq/articles/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-faq-article-form', false);
        ContextService.getInstance().setDialogContext(null, KIXObjectType.FAQ_ARTICLE, ContextMode.EDIT, null, true);
    }

}
