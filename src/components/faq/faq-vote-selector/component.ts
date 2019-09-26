/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FAQService } from '../../../core/browser/faq';
import { FAQArticle, FAQVote, CreateFAQVoteOptions } from '../../../core/model/kix/faq';
import { KIXObjectType, ComponentContent, OverlayType, StringContent, ToastContent } from '../../../core/model';
import { ServiceRegistry, OverlayService, ContextService, BrowserUtil } from '../../../core/browser';
import { FAQDetailsContext } from '../../../core/browser/faq/context/FAQDetailsContext';
import { ApplicationEvent } from '../../../core/browser/application';
import { EventService } from '../../../core/browser/event';

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
            const service = ServiceRegistry.getServiceInstance<FAQService>(KIXObjectType.FAQ_VOTE);
            const faqVote = new FAQVote();
            faqVote.Rating = rating;
            // TODO: auf angemeldeten Agenten/IP ändern
            faqVote.Interface = 'agent';
            faqVote.IPAddress = '192.168.0.1';

            await service.createObject(KIXObjectType.FAQ_VOTE, faqVote, new CreateFAQVoteOptions(this.faqArticle.ID))
                .then(() => {
                    const content = new ComponentContent(
                        'toast',
                        new ToastContent('kix-icon-check', 'Translatable#Successfully rated.')
                    );

                    OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
                }).catch((error) => {
                    OverlayService.getInstance().openOverlay(
                        OverlayType.WARNING, null, new StringContent(error), 'Translatable#Error!', true
                    );
                });

            const context = await ContextService.getInstance().getContext(FAQDetailsContext.CONTEXT_ID);
            await context.getObject(KIXObjectType.FAQ_ARTICLE, true);
            EventService.getInstance().publish(ApplicationEvent.REFRESH);
        }
    }

}

module.exports = Component;
