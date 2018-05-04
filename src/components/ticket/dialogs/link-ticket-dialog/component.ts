import { KIXObjectSearchService, IFormTableLayer } from "@kix/core/dist/browser";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormService } from "@kix/core/dist/browser/form";
import { FormContext, FormDropdownItem, KIXObject, KIXObjectType, WidgetType } from "@kix/core/dist/model";
import { LinkTicketDialogComponentState } from './LinkTicketDialogComponentState';

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
        this.getStandardTable();
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
        this.getStandardTable();

        if (this.state.currentItem) {
            const formInstance = FormService.getInstance().getOrCreateFormInstance(item.id.toString());
            formInstance.reset();
        } else {
            this.state.standardTable = null;
            this.state.resultCount = 0;
        }
    }

    private async executeSearch(): Promise<void> {
        this.state.loading = true;
        this.state.searchResult = await KIXObjectSearchService.getInstance().executeFormSearch<T>(
            KIXObjectType.TICKET, this.state.currentItem.id.toString()
        );
        this.state.loading = false;

        if (this.state.standardTable && this.state.currentItem) {
            (this.state.standardTable.contentLayer as IFormTableLayer).setFormId(this.state.currentItem.id.toString());
            await this.state.standardTable.loadRows();
            this.state.resultCount = this.state.standardTable.getTableRows().length;
        }
    }

    private getStandardTable(): void {
        if (this.state.currentItem) {
            this.state.standardTable =
                KIXObjectSearchService.getInstance().getFormResultTable<T>(
                    (this.state.currentItem.label as KIXObjectType)
                );
        }
        (this.state.standardTable.contentLayer as IFormTableLayer).setFormId(null);
        this.state.standardTable.loadRows();
    }
}

module.exports = LinkTicketDialogComponent;
