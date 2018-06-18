import {
    KIXObjectSearchService, IFormTableLayer, DialogService, OverlayService, ILinkDescriptionLabelLayer, WidgetService
} from "@kix/core/dist/browser";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormService } from "@kix/core/dist/browser/form";
import {
    FormContext, FormDropdownItem, KIXObject, KIXObjectType, WidgetType,
    CreateLinkDescription, LinkTypeDescription, OverlayType, StringContent, ComponentContent, ObjectIcon
} from "@kix/core/dist/model";
import { LinkTicketDialogComponentState } from './LinkTicketDialogComponentState';

class LinkTicketDialogComponent<T extends KIXObject> {

    private state: LinkTicketDialogComponentState<T>;

    public onCreate(): void {
        this.state = new LinkTicketDialogComponentState();
    }

    public onInput(input: any): void {
        this.state.linkDescriptions = input.linkDescriptions || [];
        this.setPreventSelectionFilterOfStandardTable();
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

            const formInstance = FormService.getInstance().getFormInstance(
                this.state.currentLinkableObject.id.toString()
            );
            formInstance.reset();

            formInstance.registerListener({
                formValueChanged: () => {
                    this.state.canSearch = formInstance.hasValues();
                },
                updateForm: () => { return; }
            });
        }

        WidgetService.getInstance().setWidgetType('link-ticket-dialog-form-widget', WidgetType.GROUP);
        this.getStandardTable();
        this.setPreventSelectionFilterOfStandardTable();
        this.setLinkTypes();
        // TODO: nur temporär, später ggf. über eine TableFactory neue Tabellen-Instanz erstellen
        if (this.state.standardTable) {
            this.state.standardTable.highlightLayer.setHighlightedObjects([]);
        }

        document.addEventListener('keydown', (event: any) => {
            if (event.key === 'Enter' && this.state.canSearch) {
                this.executeSearch();
            }
        });
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
                    // TODO: FormContext sollte Search sein
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
        this.state.selectedObjects = [];

        if (!this.state.currentLinkableObject) {
            this.state.standardTable = null;
            this.state.resultCount = null;
        }
        this.setLinkTypes();
    }

    private async executeSearch(): Promise<void> {
        this.state.resultCount = null;
        if (this.state.standardTable && this.state.currentLinkableObject) {
            (this.state.standardTable.contentLayer as IFormTableLayer)
                .setFormId(this.state.currentLinkableObject.id.toString());

            this.state.canSearch = false;
            await this.state.standardTable.loadRows();
            const count = this.state.standardTable.getTableRows().length;
            this.state.resultCount = count > 0 ? count : null;
            this.state.canSearch = true;
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
        this.state.standardTable.selectionListener.addListener(this.objectSelectionChanged.bind(this));
    }

    private setPreventSelectionFilterOfStandardTable(): void {
        if (this.state.standardTable && this.state.linkDescriptions) {
            const objects = this.state.linkDescriptions.map((ld) => ld.linkableObject);
            this.state.standardTable.preventSelectionLayer.setPreventSelectionFilter(objects);
        }
    }

    private objectSelectionChanged(objects: T[]): void {
        this.state.selectedObjects = objects;
    }

    private canSubmit(): boolean {
        return this.state.selectedObjects.length > 0 && this.state.currentLinkTypeDescription !== null;
    }

    private submitClicked(): void {
        if (this.canSubmit()) {
            const newLinks = this.state.selectedObjects.map(
                (so) => new CreateLinkDescription(so, this.state.currentLinkTypeDescription)
            );
            this.state.linkDescriptions = [...this.state.linkDescriptions, ...newLinks];
            DialogService.getInstance().publishDialogResult('link-ticket-dialog', this.state.linkDescriptions);
            this.showSuccessHint(newLinks.length);
            this.state.standardTable.highlightLayer.setHighlightedObjects(this.state.selectedObjects);
            this.setPreventSelectionFilterOfStandardTable();
            this.state.standardTable.selectionListener.selectNone();
            const labelLayer = (this.state.standardTable.labelLayer as ILinkDescriptionLabelLayer);
            labelLayer.setLinkDescriptions(this.state.linkDescriptions);
            this.state.standardTable.loadRows(true);
        }
    }

    private showSuccessHint(count: number): void {
        this.state.successHint = `${count} Verknüpfung(en) erfolgreich zugeordnet `;
        const content = new ComponentContent('list-with-title', {
            title: 'Erfolgreich ausgeführt',
            list: [this.state.successHint],
            icon: 'kix-icon-check'
        });

        OverlayService.getInstance().openOverlay(OverlayType.TOAST, null, content, '');
    }

    private setLinkTypes(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData && objectData.linkTypes) {
            if (this.state.currentLinkableObject) {
                objectData.linkTypes.forEach((lt) => {
                    if (
                        (lt.Source === KIXObjectType.TICKET && lt.Target === this.state.currentLinkableObject.label) ||
                        (lt.Target === KIXObjectType.TICKET && lt.Source === this.state.currentLinkableObject.label)
                    ) {
                        if (!this.state.linkTypes.some((lo) => lo.label === lt.SourceName)) {
                            const dropdpwnItem = new FormDropdownItem(
                                lt.SourceName, '', lt.SourceName, null, new LinkTypeDescription(lt, true)
                            );
                            this.state.linkTypes.push(dropdpwnItem);
                        }
                        if (lt.Pointed !== 0 && !this.state.linkTypes.some((lo) => lo.label === lt.TargetName)) {
                            const dropdownItem = new FormDropdownItem(
                                lt.TargetName, '', lt.TargetName, null, new LinkTypeDescription(lt, false)
                            );
                            this.state.linkTypes.push(dropdownItem);
                        }
                    }
                });
            } else {
                this.state.linkTypes = [];
                this.state.currentLinkTypeDescription = null;
            }
            (this as any).setStateDirty('linkTypes');
        }
    }

    private linkTypeChanged(item: FormDropdownItem): void {
        this.state.currentDropDownItem = item;
        this.state.currentLinkTypeDescription = item ? item.object : null;
    }
}

module.exports = LinkTicketDialogComponent;
