import { ContextService, BrowserUtil } from '../../../../core/browser';
import { KIXObjectType, ContextMode, TicketProperty, Ticket } from '../../../../core/model';
import { ComponentState } from './ComponentState';
import { TicketDetailsContext, NewTicketDialogContext } from '../../../../core/browser/ticket';
import { RoutingConfiguration } from '../../../../core/browser/router';
import { AbstractNewDialog } from '../../../../core/browser/components/dialog';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Ticket',
            'Translatable#Ticket successfully created.',
            KIXObjectType.TICKET,
            new RoutingConfiguration(
                null, TicketDetailsContext.CONTEXT_ID, KIXObjectType.TICKET,
                ContextMode.DETAILS, TicketProperty.TICKET_ID, true
            )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);

        const context = await ContextService.getInstance().getContext(NewTicketDialogContext.CONTEXT_ID);
        context.initContext();
        this.state.loading = false;
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit().then(async () => {
            const context = await ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
            const ticket = await context.getObject<Ticket>(KIXObjectType.TICKET, true, [TicketProperty.ARTICLES]);
            if (ticket) {
                const article = ticket.Articles.sort((a, b) => b.ArticleID - a.ArticleID)[0];
                if (article.isUnsent()) {
                    BrowserUtil.openErrorOverlay(article.getUnsentError());
                }
            }
        });
    }

}

module.exports = Component;
