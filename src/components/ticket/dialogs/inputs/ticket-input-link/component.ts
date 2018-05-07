import { LinkTicketComponentState } from "./LinkTicketComponentState";
import { FormInputComponentState, ObjectIcon, AttachmentError } from "@kix/core/dist/model";
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
        DialogService.getInstance().openOverlayDialog('link-ticket-dialog', {}, 'Ticket verknüpfen', 'kix-icon-link');
    }

    private minimize(): void {
        this.state.minimized = !this.state.minimized;
    }

}

module.exports = ArticleInputAttachmentComponent;
