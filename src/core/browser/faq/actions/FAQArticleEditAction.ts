import { AbstractAction, CRUD } from "../../../model";
import { UIComponentPermission } from "../../../model/UIComponentPermission";
import { FAQArticleDialogUtil } from "../FAQArticleDialogUtil";

export class FAQArticleEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('faq/articles/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        FAQArticleDialogUtil.edit();
    }

}
