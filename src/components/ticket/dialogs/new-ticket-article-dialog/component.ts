import { ContextService, BrowserUtil } from '../../../../core/browser';
import { KIXObjectType, CreateTicketArticleOptions, TicketProperty, Ticket } from '../../../../core/model';
import { ComponentState } from './ComponentState';
import { TicketDetailsContext, NewTicketArticleContext } from '../../../../core/browser/ticket';
import {
    AbstractNewDialog, TabContainerEvent, TabContainerEventData
} from '../../../../core/browser/components/dialog';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { EventService } from '../../../../core/browser/event';

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Article',
            'Translatable#Article successfully created.',
            KIXObjectType.ARTICLE,
            null
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        (this.state as ComponentState).translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);

        const context = await ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
        const dialogContext = await ContextService.getInstance().getContext(NewTicketArticleContext.CONTEXT_ID);
        if (dialogContext) {
            const tabTitle = dialogContext.getAdditionalInformation('NEW_ARTICLE_TAB_TITLE');
            if (tabTitle) {
                EventService.getInstance().publish(
                    TabContainerEvent.CHANGE_TITLE, new TabContainerEventData('new-ticket-article-dialog', tabTitle)
                );
            }
            const tabIcon = dialogContext.getAdditionalInformation('NEW_ARTICLE_TAB_ICON');
            if (tabIcon) {
                EventService.getInstance().publish(
                    TabContainerEvent.CHANGE_ICON,
                    new TabContainerEventData('new-ticket-article-dialog', null, tabIcon)
                );
            }
        }
        this.options = new CreateTicketArticleOptions(
            Number(context.getObjectId())
        );
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit();
        const context = await ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
        const ticket = await context.getObject<Ticket>(KIXObjectType.TICKET, true, [TicketProperty.ARTICLES]);
        const article = ticket.Articles.sort((a, b) => b.ArticleID - a.ArticleID)[0];
        if (article.isUnsent()) {
            BrowserUtil.openErrorOverlay(article.getUnsentError());
        }
    }

}

module.exports = Component;
