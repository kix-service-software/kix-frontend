import { AbstractNewDialog, ContextService } from "../../../../core/browser";
import { KIXObjectType, CreateTicketArticleOptions, TicketProperty } from "../../../../core/model";
import { ComponentState } from './ComponentState';
import { TicketDetailsContext } from "../../../../core/browser/ticket";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Artikel wird angelegt',
            'Artikel wurde erfolgreich angelegt.',
            KIXObjectType.ARTICLE,
            null
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const context = await ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
        this.options = new CreateTicketArticleOptions(Number(context.getObjectId()));
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
        await context.getObject(KIXObjectType.TICKET, true, [TicketProperty.ARTICLES]);
    }

}

module.exports = Component;
