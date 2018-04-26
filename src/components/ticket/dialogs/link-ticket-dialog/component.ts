import { ContextService, ContextNotification } from "@kix/core/dist/browser/context";
import { Context, WidgetType } from "@kix/core/dist/model";
import { LinkTicketDialogComponentState } from './LinkTicketDialogComponentState';

class LinkTicketDialogComponent {

    private state: LinkTicketDialogComponentState;

    public onCreate(): void {
        this.state = new LinkTicketDialogComponentState();
    }

}

module.exports = LinkTicketDialogComponent;
