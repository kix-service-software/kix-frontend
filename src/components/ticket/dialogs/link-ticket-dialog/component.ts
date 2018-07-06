import {
    KIXObjectSearchService, IFormTableLayer, DialogService, OverlayService, ILinkDescriptionLabelLayer, WidgetService
} from "@kix/core/dist/browser";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormService } from "@kix/core/dist/browser/form";
import {
    FormContext, KIXObject, KIXObjectType, WidgetType, CreateLinkDescription, LinkTypeDescription,
    OverlayType, ComponentContent, TreeNode
} from "@kix/core/dist/model";
import { ComponentState } from './ComponentState';

class LinkTicketDialogComponent<T extends KIXObject> {

    private state: ComponentState<T>;
    public linkTypeDescriptions: LinkTypeDescription[] = [];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.linkDescriptions = input.linkDescriptions || [];
        this.setPreventSelectionFilterOfStandardTable();
    }

    public onMount(): void {
        this.setLinkableObjects();
        if (this.state.linkableObjectNodes.length) {
            const linkableTicket = this.state.linkableObjectNodes.find((lo) => lo.label === KIXObjectType.TICKET);
            if (linkableTicket) {
                this.state.currentLinkableObjectNode = linkableTicket;
            } else {
                this.state.currentLinkableObjectNode = this.state.linkableObjectNodes[0];
            }

            const formInstance = FormService.getInstance().getFormInstance(
                this.state.currentLinkableObjectNode.id.toString()
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
            this.state.standardTable.layerConfiguration.highlightLayer.setHighlightedObjects([]);
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
                if (linkableObject && !this.state.linkableObjectNodes.some((lo) => lo.label === linkableObject)) {
                    const formId = FormService.getInstance().getFormIdByContext(FormContext.LINK, linkableObject);
                    if (formId) {
                        this.state.linkableObjectNodes.push(new TreeNode(formId, linkableObject));
                    }
                }
            });
            if (this.state.linkableObjectNodes.length) {
                (this as any).setStateDirty('linkableObjectNodes');
            }
        }
    }

    public linkableObjectChanged(nodes: TreeNode[]): void {
        this.state.currentLinkableObjectNode = nodes && nodes.length ? nodes[0] : null;
        this.state.selectedObjects = [];

        if (!this.state.currentLinkableObjectNode) {
            this.state.standardTable = null;
            this.state.resultCount = null;
        } else {
            this.getStandardTable();
        }
        this.setLinkTypes();
    }

    private async executeSearch(): Promise<void> {
        this.state.resultCount = null;
        if (this.state.standardTable && this.state.currentLinkableObjectNode) {
            (this.state.standardTable.layerConfiguration.contentLayer as IFormTableLayer)
                .setFormId(this.state.currentLinkableObjectNode.id.toString());

            this.state.canSearch = false;
            await this.state.standardTable.loadRows();
            const count = this.state.standardTable.getTableRows().length;
            this.state.resultCount = count > 0 ? count : null;
            this.state.canSearch = true;
        }
    }

    private getStandardTable(): void {
        if (this.state.currentLinkableObjectNode) {
            this.state.standardTable =
                KIXObjectSearchService.getInstance().getFormResultTable<T>(
                    (this.state.currentLinkableObjectNode.label as KIXObjectType)
                );
        }
        (this.state.standardTable.layerConfiguration.contentLayer as IFormTableLayer).setFormId(null);
        this.state.standardTable.loadRows();
        this.state.standardTable.listenerConfiguration.selectionListener.addListener(
            this.objectSelectionChanged.bind(this)
        );
    }

    private setPreventSelectionFilterOfStandardTable(): void {
        if (this.state.standardTable && this.state.linkDescriptions) {
            const objects = this.state.linkDescriptions.map((ld) => ld.linkableObject);
            this.state.standardTable.layerConfiguration.preventSelectionLayer.setPreventSelectionFilter(objects);
        }
    }

    private objectSelectionChanged(objects: T[]): void {
        this.state.selectedObjects = objects;
    }

    private canSubmit(): boolean {
        return this.state.selectedObjects.length > 0 && this.state.currentLinkTypeDescription !== null;
    }

    public submitClicked(): void {
        if (this.canSubmit()) {
            const newLinks = this.state.selectedObjects.map(
                (so) => new CreateLinkDescription(so, this.state.currentLinkTypeDescription)
            );
            this.state.linkDescriptions = [...this.state.linkDescriptions, ...newLinks];
            DialogService.getInstance().publishDialogResult('link-ticket-dialog', this.state.linkDescriptions);
            this.showSuccessHint(newLinks.length);
            this.state.standardTable.layerConfiguration.highlightLayer.setHighlightedObjects(
                this.state.selectedObjects
            );
            this.setPreventSelectionFilterOfStandardTable();
            this.state.standardTable.listenerConfiguration.selectionListener.selectNone();
            const labelLayer = (this.state.standardTable.layerConfiguration.labelLayer as ILinkDescriptionLabelLayer);
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
        this.linkTypeDescriptions = [];
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData && objectData.linkTypes) {
            if (this.state.currentLinkableObjectNode) {
                objectData.linkTypes.forEach((lt) => {
                    if (
                        (
                            lt.Source === KIXObjectType.TICKET &&
                            lt.Target === this.state.currentLinkableObjectNode.label
                        ) ||
                        (
                            lt.Target === KIXObjectType.TICKET &&
                            lt.Source === this.state.currentLinkableObjectNode.label
                        )
                    ) {
                        if (!this.state.linkTypeNodes.some((lo) => lo.label === lt.SourceName)) {
                            const id = this.linkTypeDescriptions.length;
                            this.linkTypeDescriptions.push(new LinkTypeDescription(lt, true));
                            const node = new TreeNode(id, lt.SourceName);
                            this.state.linkTypeNodes.push(node);
                        }
                        if (lt.Pointed !== 0 && !this.state.linkTypeNodes.some((lo) => lo.label === lt.TargetName)) {
                            const id = this.linkTypeDescriptions.length;
                            this.linkTypeDescriptions.push(new LinkTypeDescription(lt, false));
                            const node = new TreeNode(id, lt.TargetName);
                            this.state.linkTypeNodes.push(node);
                        }
                    }
                });
            } else {
                this.state.linkTypeNodes = [];
                this.state.currentLinkTypeDescription = null;
            }
            (this as any).setStateDirty('linkTypeNodes');
        }
    }

    public linkTypeChanged(nodes: TreeNode[]): void {
        this.state.currentLinkTypeNode = nodes && nodes.length ? nodes[0] : null;
        this.state.currentLinkTypeDescription = this.state.currentLinkTypeNode ?
            this.linkTypeDescriptions[this.state.currentLinkableObjectNode.id] : null;
    }
}

module.exports = LinkTicketDialogComponent;
