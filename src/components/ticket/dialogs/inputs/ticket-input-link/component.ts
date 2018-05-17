import { LinkTicketComponentState } from "./LinkTicketComponentState";
import {
    FormInputComponentState, ObjectIcon, AttachmentError, CreateLinkDescription,
    Ticket, FormFieldValue, FormInputComponent
} from "@kix/core/dist/model";
import { AttachmentUtil, FormService } from "@kix/core/dist/browser";
import { DialogService } from "@kix/core/dist/browser/dialog/DialogService";
import { Label } from "@kix/core/dist/browser/components";

class ArticleInputAttachmentComponent extends FormInputComponent<CreateLinkDescription[], LinkTicketComponentState> {

    public onCreate(): void {
        this.state = new LinkTicketComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
    }

    public setCurrentValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue<CreateLinkDescription[]>(this.state.field.property);
            if (value) {
                this.state.linkDescriptions = value.value ? value.value : [];
            }
        }
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
                'link-ticket-dialog', 'ticket-input-link', this.ticketLinksChanged.bind(this)
            );
    }

    private ticketLinksChanged(linkDescriptions: CreateLinkDescription[]): void {
        this.state.linkDescriptions = linkDescriptions;
        this.updateField();
    }

    private minimize(): void {
        this.state.minimized = !this.state.minimized;
    }

    private removeLink(label: Label): void {
        const index = this.state.linkDescriptions.findIndex((ld) => ld.linkableObject === label.object);
        if (index !== -1) {
            this.state.linkDescriptions.splice(index, 1);
            this.updateField();
            this.createLabels();
        }
    }

    private updateField(): void {
        this.createLabels();
        super.provideValue(this.state.linkDescriptions);
    }

    private createLabels(): void {
        this.state.labels = this.state.linkDescriptions.map((ld) => {
            const linkLabel = ld.linkTypeDescription.asSource
                ? ld.linkTypeDescription.linkType.SourceName
                : ld.linkTypeDescription.linkType.TargetName;
            return new Label(ld.linkableObject, null, null, null, `(${linkLabel})`);
        });
    }

}

module.exports = ArticleInputAttachmentComponent;
