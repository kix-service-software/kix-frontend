import { ContextService } from "@kix/core/dist/browser/context";
import { LinkTicketDialogComponentState } from './LinkTicketDialogComponentState';
import { KIXObjectType, ObjectData, FormContext, FormDropdownItem, WidgetType } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class LinkTicketDialogComponent {

    private state: LinkTicketDialogComponentState;

    public onCreate(): void {
        this.state = new LinkTicketDialogComponentState();
    }

    public onMount(): void {
        this.setLinkableObjects();
        if (this.state.linkableObjects.length) {
            const linkableTicket = this.state.linkableObjects.find((lo) => lo.label === KIXObjectType.TICKET);
            if (linkableTicket) {
                this.state.currentItem = linkableTicket;
            } else {
                this.state.currentItem = this.state.linkableObjects[0];
            }
        }

        const context = ContextService.getInstance().getContext();
        context.setWidgetType('link-ticket-dialog-form-widget', WidgetType.GROUP);
    }

    public setLinkableObjects(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData && objectData.linkTypes) {
            objectData.linkTypes.forEach((lt) => {
                let linkableObject = null;
                if (lt.Source === KIXObjectType.TICKET) {
                    linkableObject = lt.Target;
                } else if (lt.Target === KIXObjectType.TICKET) {
                    linkableObject = lt.Source;
                }
                if (linkableObject && !this.state.linkableObjects.some((lo) => lo.label === linkableObject)) {
                    const formId = FormService.getInstance().getFormIdByContext(FormContext.LINK, linkableObject);
                    if (formId) {
                        this.state.linkableObjects.push(new FormDropdownItem(formId, '', linkableObject));
                    }
                }
            });
            if (this.state.linkableObjects.length) {
                (this as any).setStateDirty('linkableObjects');
            }
        }
    }

    private itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
    }

    private doSearch(): void {
        alert('Starte Suche...');
    }
}

module.exports = LinkTicketDialogComponent;
