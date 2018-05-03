import { ContextService } from "@kix/core/dist/browser/context";
import { LinkTicketDialogComponentState } from './LinkTicketDialogComponentState';
import { KIXObjectType, ObjectData, FormContext, FormDropdownItem, WidgetType, KIXObject } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";
import { KIXObjectSearchService } from "@kix/core/dist/browser";

class LinkTicketDialogComponent<T extends KIXObject> {

    private state: LinkTicketDialogComponentState<T>;

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

    private async executeSearch(): Promise<void> {
        this.state.searchResult = await KIXObjectSearchService.getInstance().executeFormSearch<T>(
            KIXObjectType.TICKET, this.state.currentItem.id.toString()
        );
    }
}

module.exports = LinkTicketDialogComponent;
