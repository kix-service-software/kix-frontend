import { ComponentState } from './ComponentState';
import { FAQService, FAQDetailsContext } from '../../../core/browser/faq';
import { FAQArticle, FAQVote, CreateFAQVoteOptions } from '../../../core/model/kix/faq';
import { KIXObjectType, ComponentContent, OverlayType, StringContent, ToastContent } from '../../../core/model';
import { ServiceRegistry, OverlayService, ContextService, BrowserUtil } from '../../../core/browser';

export class Component {

    private state: ComponentState;

    private faqArticle: FAQArticle;
    public rating: number = 0;
    public voteCount: number = 0;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any) {
        this.faqArticle = input.faqArticle;
        if (this.faqArticle && this.faqArticle.Votes) {
            this.rating = BrowserUtil.calculateAverage(this.faqArticle.Votes.map((v) => v.Rating));
            this.voteCount = this.faqArticle.Votes.length;
        }
    }

    public setCurrentRating(rating: number): void {
        this.state.currentRating = rating;
    }

    public getIcon(rating: number): string {
        if (this.state.currentRating && rating <= this.state.currentRating) {
            return 'kix-icon-star-fully';
        }
        return 'kix-icon-star-empty';
    }

    public async vote(rating: number): Promise<void> {
        if (this.faqArticle) {
            const service
                = ServiceRegistry.getServiceInstance<FAQService>(KIXObjectType.FAQ_VOTE);
            const faqVote = new FAQVote();
            faqVote.Rating = rating;
            // TODO: auf angemeldeten Agenten/IP ändern
            faqVote.Interface = 'agent';
            faqVote.IPAddress = '192.168.0.1';

            await service.createObject(KIXObjectType.FAQ_VOTE, faqVote, new CreateFAQVoteOptions(this.faqArticle.ID))
                .then(() => {
                    const content = new ComponentContent(
                        'toast',
                        new ToastContent('kix-icon-check', 'Bewertung erfolgreich abgegeben.')
                    );

                    OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
                }).catch((error) => {
                    OverlayService.getInstance().openOverlay(
                        OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true
                    );
                });

            const context = await ContextService.getInstance().getContext(FAQDetailsContext.CONTEXT_ID);
            await context.getObject(KIXObjectType.FAQ_ARTICLE, true);
        }
    }

}

module.exports = Component;
