import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode } from '../../../model';

export class FAQArticleCreateAction extends AbstractAction {

    public initAction(): void {
        this.text = "Neue FAQ";
        this.icon = "kix-icon-new-faq";
    }

    public run(): void {
        ContextService.getInstance().setDialogContext(null, KIXObjectType.FAQ_ARTICLE, ContextMode.CREATE, null, true);
    }

}
