import { AbstractAction, OverlayType, ComponentContent } from '../../../model';
import { EventService } from '../../event';
import { FAQEvent } from '../FAQEvent';
import { OverlayService } from '../../OverlayService';

export class FAQArticleVoteAction extends AbstractAction {

    public initAction(): void {
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
