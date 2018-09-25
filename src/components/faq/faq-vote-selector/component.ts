import { ComponentState } from './ComponentState';
import { EventService, IEventListener } from '@kix/core/dist/browser/event';
import { FAQEvent, FAQService } from '@kix/core/dist/browser/faq';
import { FAQArticle, FAQVote, CreateFAQVoteOptions } from '@kix/core/dist/model/kix/faq';
import { KIXObjectType, ComponentContent, OverlayType, StringContent, ToastContent } from '@kix/core/dist/model';
import { ServiceRegistry, OverlayService } from '@kix/core/dist/browser';

export class Component implements IEventListener {
    public eventSubscriberId: string = 'FAQ_VOTE_COMPONENT';

    private state: ComponentState;

    private faqArticle: FAQArticle;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        EventService.getInstance().subscribe(FAQEvent.SHOW_FAQ_VOTE, this);

        document.addEventListener("click", (event: any) => {
            if (this.state.show) {
                if (this.state.keepShow) {
                    this.state.keepShow = false;
                } else {
                    this.state.show = false;
                }
            }
        }, false);
    }

    public eventPublished(faqArticle: FAQArticle): void {
        this.faqArticle = faqArticle;
        this.state.show = true;
        this.state.keepShow = true;
    }

    public selectorClicked(event: any): void {
        if (event.preventDefault) {
            event.preventDefault(event);
        }
        this.state.keepShow = true;
    }

    public async vote(rating: number): Promise<void> {
        if (this.faqArticle) {
            const service
                = ServiceRegistry.getInstance().getServiceInstance<FAQService>(KIXObjectType.FAQ_VOTE);
            const faqVote = new FAQVote();
            faqVote.Rating = rating;
            faqVote.Interface = 'agent';
            faqVote.IPAddress = '192.168.0.1';

            await service.createObject(KIXObjectType.FAQ_VOTE, faqVote, new CreateFAQVoteOptions(this.faqArticle.ID))
                .then(() => {
                    const content = new ComponentContent(
                        'toast',
                        new ToastContent('Erfolgreich ausgeführt', 'kix-icon-check', 'Bewertung erfolgreich abgegeben.')
                    );

                    OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
                    EventService.getInstance().publish(FAQEvent.VOTE_UPDATED, this.faqArticle);
                }).catch((error) => {
                    OverlayService.getInstance().openOverlay(
                        OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true
                    );
                });
            this.state.show = false;
        }
    }

}

module.exports = Component;
