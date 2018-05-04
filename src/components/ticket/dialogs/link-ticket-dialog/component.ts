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
                this.state.currentLinkableObject = linkableTicket;
            } else {
                this.state.currentLinkableObject = this.state.linkableObjects[0];
            }

            const formInstance = FormService.getInstance().getOrCreateFormInstance(
                this.state.currentLinkableObject.id.toString()
            );
            formInstance.reset();
        }

        const context = ContextService.getInstance().getContext();
        context.setWidgetType('link-ticket-dialog-form-widget', WidgetType.GROUP);
        this.getStandardTable();
        this.setLinkTypes();
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

    private linkableObjectChanged(item: FormDropdownItem): void {
        this.state.currentLinkableObject = item;
        this.getStandardTable();

        if (this.state.currentLinkableObject) {
            const formInstance = FormService.getInstance().getOrCreateFormInstance(item.id.toString());
            formInstance.reset();
        } else {
            this.state.standardTable = null;
            this.state.resultCount = null;
        }
        this.setLinkTypes();
    }

    private async executeSearch(): Promise<void> {
        this.state.resultCount = null;
        if (this.state.standardTable && this.state.currentLinkableObject) {
            (this.state.standardTable.contentLayer as IFormTableLayer).setFormId(
                this.state.currentLinkableObject.id.toString()
            );
            await this.state.standardTable.loadRows();
            const count = this.state.standardTable.getTableRows().length;
            this.state.resultCount = count > 0 ? count : null;
        }
    }

    private getStandardTable(): void {
        if (this.state.currentLinkableObject) {
            this.state.standardTable =
                KIXObjectSearchService.getInstance().getFormResultTable<T>(
                    (this.state.currentLinkableObject.label as KIXObjectType)
                );
        }
        (this.state.standardTable.contentLayer as IFormTableLayer).setFormId(null);
        this.state.standardTable.loadRows();
    }

    public setLinkTypes(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData && objectData.linkTypes) {
            if (this.state.currentLinkableObject) {
                objectData.linkTypes.forEach((lt) => {
                    if (
                        (lt.Source === KIXObjectType.TICKET && lt.Target === this.state.currentLinkableObject.label) ||
                        (lt.Target === KIXObjectType.TICKET && lt.Source === this.state.currentLinkableObject.label)
                    ) {
                        if (!this.state.linkTypes.some((lo) => lo.label === lt.SourceName)) {
                            this.state.linkTypes.push(new FormDropdownItem(lt.SourceName, '', lt.SourceName));
                        }
                        if (lt.Pointed !== 0 && !this.state.linkTypes.some((lo) => lo.label === lt.TargetName)) {
                            this.state.linkTypes.push(new FormDropdownItem(lt.TargetName, '', lt.TargetName));
                        }
                    }
                });
            } else {
                this.state.linkTypes = [];
                this.state.currentLinkType = null;
            }
            (this as any).setStateDirty('linkTypes');
        }
    }

    private linkTypeChanged(item: FormDropdownItem): void {
        this.state.currentLinkType = item;
    }
}

module.exports = LinkTicketDialogComponent;
