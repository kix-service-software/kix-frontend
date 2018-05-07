import { LinkTicketComponentState } from "./LinkTicketComponentState";
import {
    FormInputComponentState, ObjectIcon, AttachmentError, CreateLinkDescription, Ticket
} from "@kix/core/dist/model";
import { AttachmentUtil } from "@kix/core/dist/browser";
import { DialogService } from "@kix/core/dist/browser/DialogService";

class ArticleInputAttachmentComponent {

    private state: LinkTicketComponentState;

    public onCreate(): void {
        this.state = new LinkTicketComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    private openTicketLinkDialog(): void {
        DialogService.getInstance().openOverlayDialog(
            'link-ticket-dialog',
            {
                linkDescriptions: this.state.linkDescriptions,
                resultListenerId: 'ticket-input-link'
            },
            'Ticket verknüpfen',
            'kix-icon-link'
        );
        DialogService.getInstance()
            .registerDialogResultListener<CreateLinkDescription[]>(
                'link-ticket-dialog', this.ticketLinksChanged.bind(this)
            );
    }

    private ticketLinksChanged(linkDescriptions: CreateLinkDescription[]): void {
        this.state.linkDescriptions = linkDescriptions;
    }

    private minimize(): void {
        this.state.minimized = !this.state.minimized;
    }

}

module.exports = ArticleInputAttachmentComponent;
