import { AbstractAction, KIXObjectType, ContextMode } from '../../../../../model';
import { ContextService } from '../../../../context';

export class FAQCategoryCreateAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Category';
        this.icon = 'kix-icon-new-gear';
    }

    // public async run(event: any): Promise<void> {
    //     ContextService.getInstance().setDialogContext(
    //         // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
    // tslint:disable-next-line:max-line-length
    //         null, KIXObjectType.FAQ_CATEGORY, ContextMode.CREATE_ADMIN, null, true, 'Translatable#Knowledge Database',
    //         undefined, 'new-faq-category-form'
    //     );
    // }

}
