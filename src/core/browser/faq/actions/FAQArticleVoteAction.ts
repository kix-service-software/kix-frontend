import { AbstractAction, OverlayType, ComponentContent, CRUD } from '../../../model';
import { OverlayService } from '../../OverlayService';
import { UIComponentPermission } from '../../../model/UIComponentPermission';

export class FAQArticleVoteAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('faq/articles/*/votes', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Rate';
        this.icon = 'kix-icon-star-fully';
    }

    public async run(event: any): Promise<void> {
        if (this.data && Array.isArray(this.data) && this.data.length) {
            const faqArticle = this.data[0];

            OverlayService.getInstance().openOverlay(
                OverlayType.CONTENT_OVERLAY,
                'faq-vote-action-overlay',
                new ComponentContent('faq-vote-selector', { faqArticle }),
                'Translatable#FAQ rating',
                false,
                [
                    event.target.getBoundingClientRect().left,
                    event.target.getBoundingClientRect().top
                ],
                'faq-vote-action-overlay'
            );
        }
    }

}
