import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { CRUD } from '../../../model';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { FAQArticleDialogUtil } from '../FAQArticleDialogUtil';

export class FAQArticleCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('faq/articles', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New FAQ';
        this.icon = 'kix-icon-new-faq';
    }

    public async run(event: any): Promise<void> {
        FAQArticleDialogUtil.create();
    }

}
