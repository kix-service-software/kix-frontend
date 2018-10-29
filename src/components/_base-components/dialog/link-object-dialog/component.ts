import {
    KIXObjectSearchService, DialogService, OverlayService,
    WidgetService, StandardTableFactoryService,
    TableConfiguration, TableRowHeight, TableHeaderHeight, TablePreventSelectionLayer, TableHighlightLayer,
    TableColumn, ObjectLinkDescriptionLabelLayer, StandardTable, ITableHighlightLayer,
    ITablePreventSelectionLayer, KIXObjectService, SearchOperator
} from "@kix/core/dist/browser";
import { FormService } from "@kix/core/dist/browser/form";
import {
    FormContext, KIXObject, KIXObjectType, WidgetType, CreateLinkDescription, LinkTypeDescription,
    OverlayType, ComponentContent, TreeNode, DataType, ToastContent, LinkType, KIXObjectLoadingOptions,
    FilterCriteria, FilterDataType, FilterType
} from "@kix/core/dist/model";
import { ComponentState } from './ComponentState';
import { LinkUtil } from "@kix/core/dist/browser/link";

class LinkDialogComponent {

    private state: ComponentState;
    private linkTypeDescriptions: LinkTypeDescription[] = [];
    private objectLinkLayer: ObjectLinkDescriptionLabelLayer;
    private highlightLayer: ITableHighlightLayer;
    private preventSelectionLayer: ITablePreventSelectionLayer;
    private resultListenerId: string;
    private linkPartners: Array<[string, KIXObjectType]> = [];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.linkDescriptions = !this.state.linkDescriptions
            ? input.linkDescriptions || []
            : this.state.linkDescriptions;
        this.state.objectType = input.objectType;
        this.resultListenerId = input.resultListenerId;
    }

    public onDestroy(): void {
        this.state.linkDescriptions = null;
    }

    public async onMount(): Promise<void> {
        await this.setLinkableObjects();
        await this.setDefaultLinkableObject();

        WidgetService.getInstance().setWidgetType('link-object-dialog-form-widget', WidgetType.GROUP);
        this.setLinkTypes();
        if (this.state.currentLinkableObjectNode) {
            this.prepareResultTable([]);
            if (this.state.standardTable) {
                this.highlightLayer.setHighlightedObjects([]);
            }
        }

        this.setCanSubmit();
    }

    private async setLinkableObjects(): Promise<void> {
        this.linkPartners = await LinkUtil.getPossibleLinkPartners(this.state.objectType);

        this.linkPartners.forEach((lp) => {
            const formId = FormService.getInstance().getFormIdByContext(FormContext.LINK, lp[1]);
            if (formId) {
                this.state.linkableObjectNodes.push(new TreeNode(formId, lp[0]));
            }
        });
        if (this.state.linkableObjectNodes.length) {
            (this as any).setStateDirty('linkableObjectNodes');
        }
    }

    private async setDefaultLinkableObject(): Promise<void> {
        if (this.state.linkableObjectNodes.length) {
            const ticketNode = this.state.linkableObjectNodes.find((lo) => lo.label === KIXObjectType.TICKET);
            if (ticketNode) {
                this.state.currentLinkableObjectNode = ticketNode;
            } else {
                this.state.currentLinkableObjectNode = this.state.linkableObjectNodes[0];
            }

            this.state.formId = this.state.currentLinkableObjectNode.id.toString();
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            formInstance.reset();
        }
    }

    public async keyPressed(event: any): Promise<void> {
        if (this.state.formId) {
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            if (event.key === 'Enter' && formInstance.hasValues()) {
                this.executeSearch();
            }
        }
    }

    public async linkableObjectChanged(nodes: TreeNode[]): Promise<void> {
        DialogService.getInstance().setOverlayDialogLoading(true);

        this.state.currentLinkableObjectNode = nodes && nodes.length ? nodes[0] : null;
        this.state.selectedObjects = [];
        this.state.resultCount = 0;

        this.state.formId = null;

        let formId;
        if (this.state.currentLinkableObjectNode) {
            formId = this.state.currentLinkableObjectNode.id.toString();
            const formInstance = await FormService.getInstance().getFormInstance(formId);
            formInstance.reset();
            await this.prepareResultTable([]);
        } else {
            this.state.standardTable = null;
            formId = null;
            this.state.resultCount = 0;
        }

        await this.setLinkTypes();

        (this as any).setStateDirty('currentLinkableObjectNode');

        setTimeout(() => {
            this.state.formId = formId;
            this.setCanSubmit();
            DialogService.getInstance().setOverlayDialogLoading(false);
        }, 50);
    }

    private async executeSearch(): Promise<void> {
        DialogService.getInstance().setOverlayDialogLoading(true);
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        if (this.state.currentLinkableObjectNode && formInstance.hasValues()) {
            const objects = await KIXObjectSearchService.getInstance().executeSearch(
                this.state.currentLinkableObjectNode.id
            );

            await this.prepareResultTable(objects);
            this.state.resultCount = objects.length;
            this.setCanSubmit();
        }

        DialogService.getInstance().setOverlayDialogLoading(false);
    }

    private async prepareResultTable(objects: KIXObject[]): Promise<void> {
        this.state.standardTable = null;

        if (this.state.currentLinkableObjectNode) {
            const formInstance = await FormService.getInstance().getFormInstance(
                this.state.currentLinkableObjectNode.id
            );

            const objectType = formInstance.getObjectType();

            const tableConfiguration = new TableConfiguration(
                null, 5, null, null, true, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
            const table = StandardTableFactoryService.getInstance().createStandardTable(
                objectType, tableConfiguration, null, null, true, null, true
            );

            if (table) {
                table.listenerConfiguration.selectionListener.addListener(
                    this.objectSelectionChanged.bind(this)
                );

                this.highlightLayer = new TableHighlightLayer();
                table.addAdditionalLayerOnTop(this.highlightLayer);
                this.preventSelectionLayer = new TablePreventSelectionLayer();
                table.addAdditionalLayerOnTop(this.preventSelectionLayer);
                this.objectLinkLayer = new ObjectLinkDescriptionLabelLayer();
                table.addAdditionalLayerOnTop(this.objectLinkLayer);

                table.setColumns([
                    new TableColumn(
                        'LinkedAs', DataType.STRING, '', null, true, true, 120, true, false, true, false, null
                    )
                ]);

                this.setLinkedObjectsToTableLayer(table);

                table.layerConfiguration.contentLayer.setPreloadedObjects(objects);
                await table.loadRows();

                setTimeout(() => {
                    this.state.standardTable = table;
                    this.state.tableId = 'Table-Links-' + objectType;
                }, 300);
            }
        }
    }

    private setLinkedObjectsToTableLayer(table: StandardTable = this.state.standardTable): void {
        if (this.state.linkDescriptions) {
            this.objectLinkLayer.setLinkDescriptions(this.state.linkDescriptions);
            const linkedObjects = this.state.linkDescriptions.map((ld) => ld.linkableObject);
            this.preventSelectionLayer.setPreventSelectionFilter(linkedObjects);
        }
    }

    private objectSelectionChanged(objects: KIXObject[]): void {
        this.state.selectedObjects = objects;
        this.setCanSubmit();
    }

    private setCanSubmit(): void {
        this.state.canSubmit = this.state.selectedObjects.length > 0 && this.state.currentLinkTypeDescription !== null;
    }

    public submitClicked(): void {
        if (this.state.canSubmit) {
            const newLinks = this.state.selectedObjects.map(
                (so) => new CreateLinkDescription(so, { ...this.state.currentLinkTypeDescription })
            );
            this.state.linkDescriptions = [...this.state.linkDescriptions, ...newLinks];
            DialogService.getInstance().publishDialogResult(
                this.resultListenerId,
                [this.state.linkDescriptions, newLinks]
            );
            this.showSuccessHint(newLinks.length);
            this.state.standardTable.listenerConfiguration.selectionListener.selectNone();
            this.highlightLayer.setHighlightedObjects(newLinks.map((ld) => ld.linkableObject));
            this.setLinkedObjectsToTableLayer();
            this.state.standardTable.loadRows();
            this.state.currentLinkTypeDescription = null;
        }
    }

    private showSuccessHint(count: number): void {
        const successHint = `${count} Verknüpfung(en) erfolgreich zugeordnet `;
        const content = new ComponentContent(
            'toast',
            new ToastContent('Erfolgreich ausgeführt', 'kix-icon-check', successHint)
        );

        OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
    }

    private async setLinkTypes(): Promise<void> {
        this.state.currentLinkTypeNode = null;
        this.state.linkTypeNodes = [];

        this.linkTypeDescriptions = [];

        if (this.state.currentLinkableObjectNode) {
            const linkPartner = this.linkPartners.find(
                (lp) => lp[0] === this.state.currentLinkableObjectNode.label
            );
            const loadingOptions = new KIXObjectLoadingOptions(null, [
                new FilterCriteria(
                    'Source', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, this.state.objectType
                ),
                new FilterCriteria(
                    'Target', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, linkPartner[1]
                )
            ]);

            const linkTypes = await KIXObjectService.loadObjects<LinkType>(
                KIXObjectType.LINK_TYPE, null, loadingOptions
            );

            linkTypes.forEach((lt) => {
                const id = this.linkTypeDescriptions.length;
                this.linkTypeDescriptions.push(new LinkTypeDescription(lt, true));
                const node = new TreeNode(id, lt.SourceName);
                this.state.linkTypeNodes.push(node);
                if (lt.Pointed === 1) {
                    const pointedLinkType = new LinkType(lt);
                    this.linkTypeDescriptions.push(new LinkTypeDescription(pointedLinkType, false));
                    const pointedNode = new TreeNode(id + 1, pointedLinkType.TargetName);
                    this.state.linkTypeNodes.push(pointedNode);
                }
            });
        } else {
            this.state.linkTypeNodes = [];
            this.state.currentLinkTypeDescription = null;
        }
        (this as any).setStateDirty('linkTypeNodes');
    }

    public linkTypeChanged(nodes: TreeNode[]): void {
        this.state.currentLinkTypeNode = nodes && nodes.length ? nodes[0] : null;
        this.state.currentLinkTypeDescription = this.state.currentLinkTypeNode ?
            this.linkTypeDescriptions[this.state.currentLinkTypeNode.id] : null;
        this.setCanSubmit();
    }

    public filter(filterValue: string): void {
        this.state.standardTable.setFilterSettings(filterValue);
    }
}

module.exports = LinkDialogComponent;
