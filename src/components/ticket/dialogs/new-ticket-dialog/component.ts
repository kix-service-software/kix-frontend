import { ContextService, AbstractNewDialog, FormService, BrowserUtil } from "../../../../core/browser";
import { KIXObjectType, ContextMode, TicketProperty, FormInstance, Ticket } from "../../../../core/model";
import { ComponentState } from "./ComponentState";
import { TicketDetailsContext, NewTicketDialogContext } from "../../../../core/browser/ticket";
import { RoutingConfiguration } from "../../../../core/browser/router";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Ticket wird angelegt',
            'Ticket wurde erfolgreich angelegt.',
            KIXObjectType.TICKET,
            new RoutingConfiguration(
                null, TicketDetailsContext.CONTEXT_ID, KIXObjectType.TICKET,
                ContextMode.DETAILS, TicketProperty.TICKET_ID, true
            )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const context = await ContextService.getInstance().getContext(NewTicketDialogContext.CONTEXT_ID);
        context.reset();
        this.state.loading = false;
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
        if (ticket) {
            const article = ticket.Articles.sort((a, b) => b.ArticleID - a.ArticleID)[0];
            if (article.isUnsent()) {
                BrowserUtil.openErrorOverlay(article.getUnsentError());
            }
        }
    }

}

module.exports = Component;
