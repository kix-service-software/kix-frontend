import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode, CRUD } from '../../../model';
import { UIComponentPermission } from '../../../model/UIComponentPermission';

export class FAQArticleCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('faq/articles', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New FAQ';
        this.icon = 'kix-icon-new-faq';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.FAQ_ARTICLE, ContextMode.CREATE, null, true,
            undefined, undefined, 'new-faq-article-form'
        );
    }

}
