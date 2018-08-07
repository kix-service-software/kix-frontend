import { ComponentState } from './ComponentState';
import {
    DialogService, OverlayService, WidgetService,
    ContextService, StandardTableFactoryService, ITableHighlightLayer,
    TableHighlightLayer, LabelService, KIXObjectServiceRegistry, SearchOperator
} from '@kix/core/dist/browser';
import {
    ComponentContent, OverlayType, StringContent,
    WidgetType, Link, KIXObject, LinkObject, KIXObjectType,
    CreateLinkDescription, KIXObjectPropertyFilter, TableFilterCriteria,
    LinkObjectProperty, LinkTypeDescription, ObjectData, LinkType
} from '@kix/core/dist/model';

class Component {

    private state: ComponentState;
    private linkRootObject: KIXObject = null;
    private links: Link[] = [];
    private allLinkObjects: LinkObject[] = [];
    private newLinkObjects: LinkObject[] = [];
    private linkedObjects: KIXObject[] = [];
    private linkDescriptions: CreateLinkDescription[] = [];
    private linkDescriptionsForCreate: CreateLinkDescription[] = [];
    private highlightLayer: ITableHighlightLayer;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.linkRootObject = null;
        this.links = [];
        this.allLinkObjects = [];
        this.newLinkObjects = [];
        this.linkedObjects = [];
        this.linkDescriptions = [];
        this.linkDescriptionsForCreate = [];
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('link-objects-preview-table', WidgetType.GROUP);
        const activeContext = ContextService.getInstance().getActiveContext();
        if (activeContext) {
            this.linkRootObject = await activeContext.getObject();
            this.links = this.linkRootObject ? this.linkRootObject.Links : [];

            await this.prepareLinkObjects();
            await this.reviseLinkObjects();
            this.setInitialLinkDescriptions();

            this.state.table = StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.LINK_OBJECT
            );

            this.highlightLayer = new TableHighlightLayer();
            this.state.table.addAdditionalLayerOnTop(this.highlightLayer);

            this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(this.allLinkObjects);
            this.state.table.loadRows(true);
            this.highlightNewLinkObjects();
            this.state.linkObjectCount = this.allLinkObjects.length;
        }
    }

    private async prepareLinkObjects(): Promise<void> {
        const objectData = ContextService.getInstance().getObjectData();
        if (this.links && this.links.length && objectData) {

            this.allLinkObjects = this.links.map((l: Link) => {
                const linkObject: LinkObject = new LinkObject();
                const linkedAs = objectData.linkTypes.find((lt) => lt.Name === l.Type);
                if (
                    l.SourceObject === this.linkRootObject.KIXObjectType &&
                    l.SourceKey.toString() === this.linkRootObject.ObjectId.toString()
                ) {
                    linkObject.ObjectId = l.ObjectId || l.ID;
                    linkObject.linkedObjectKey = l.TargetKey.toString();
                    linkObject.linkedObjectType = l.TargetObject as KIXObjectType;
                    linkObject.linkedAs = linkedAs.TargetName;
                } else {
                    linkObject.ObjectId = l.ObjectId || l.ID;
                    linkObject.linkedObjectKey = l.SourceKey.toString();
                    linkObject.linkedObjectType = l.SourceObject as KIXObjectType;
                    linkObject.linkedAs = linkedAs.SourceName;
                    linkObject.isSource = true;
                }
                return linkObject;
            });
        }
    }

    private async reviseLinkObjects(): Promise<void> {
        const linkedObjectIds: Map<KIXObjectType, string[]> = new Map();
        this.allLinkObjects.forEach((lo) => {
            if (linkedObjectIds.has(lo.linkedObjectType)) {
                if (linkedObjectIds.get(lo.linkedObjectType).findIndex((id) => id === lo.linkedObjectKey) === -1) {
                    linkedObjectIds.get(lo.linkedObjectType).push(lo.linkedObjectKey);
                }
            } else {
                linkedObjectIds.set(lo.linkedObjectType, [lo.linkedObjectKey]);
            }
        });
        await this.getLinkedObjectsAndSetLinkObjectsTitles(linkedObjectIds);
        this.setFilter(linkedObjectIds);
    }

    private async getLinkedObjectsAndSetLinkObjectsTitles(linkedObjectIds): Promise<void> {
        const linkedObjectIdsIterator = linkedObjectIds.entries();
        let linkedObjectIdsByType = linkedObjectIdsIterator.next();
        while (linkedObjectIdsByType && linkedObjectIdsByType.value) {
            const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(linkedObjectIdsByType.value[0]);

            const objects = linkedObjectIdsByType.value[1].length ?
                await service.loadObjects(linkedObjectIdsByType.value[0], linkedObjectIdsByType.value[1], null)
                : [];
            this.linkedObjects = [...this.linkedObjects, ...objects];
            this.linkedObjects.forEach((o) => {
                const linkObject = this.allLinkObjects.find(
                    (lo) => lo.linkedObjectType === o.KIXObjectType && lo.linkedObjectKey === o.ObjectId.toString()
                );
                if (linkObject) {
                    linkObject.title = service.getDetailsTitle(o);
                }
            });
            linkedObjectIdsByType = linkedObjectIdsIterator.next();
        }
    }

    private setFilter(linkedObjectIds): void {
        linkedObjectIds.forEach((ids, type) => {
            this.state.predefinedTableFilter.push(
                new KIXObjectPropertyFilter(type.toString(), [
                    new TableFilterCriteria(
                        LinkObjectProperty.LINKED_OBJECT_TYPE, SearchOperator.EQUALS, type.toString()
                    )
                ]),
            );
        });
    }

    private setInitialLinkDescriptions(): void {
        this.linkDescriptions = this.allLinkObjects.map((lo) => {
            const linkedObject = this.linkedObjects.find(
                (ldo) => ldo.ObjectId.toString() === lo.linkedObjectKey && ldo.KIXObjectType === lo.linkedObjectType
            );
            if (linkedObject) {
                const objectData = ContextService.getInstance().getObjectData();
                let linkType: LinkType;
                if (objectData) {
                    const link = this.linkRootObject.Links.find((l) => l.ID === lo.ObjectId);
                    if (link) {
                        linkType = objectData.linkTypes.find((lt) => {
                            if (lo.isSource) {
                                return lt.Name === link.Type &&
                                    lt.Source === lo.linkedObjectType &&
                                    lt.Target === this.linkRootObject.KIXObjectType;
                            } else {
                                return lt.Name === link.Type &&
                                    lt.Source === this.linkRootObject.KIXObjectType &&
                                    lt.Target === lo.linkedObjectType;
                            }
                        });
                    }
                }
                if (linkType) {
                    return new CreateLinkDescription(linkedObject, new LinkTypeDescription(linkType, lo.isSource));
                }
            }
        });
    }

    public filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        this.state.table.setFilterSettings(textFilterValue, filter);
    }

    public openAddLinkDialog(): void {
        let dialogTitle = 'Objekt verknüpfen';
        const labelProvider = LabelService.getInstance().getLabelProviderForType(this.linkRootObject.KIXObjectType);
        if (labelProvider) {
            dialogTitle = `${labelProvider.getObjectName(false)} verknüpfen`;
        }
        const resultListenerId = 'result-listener-link-' + this.linkRootObject.KIXObjectType + '-edit-links';
        DialogService.getInstance().openOverlayDialog(
            'link-object-dialog',
            {
                linkDescriptions: this.linkDescriptions,
                objectType: this.linkRootObject.KIXObjectType,
                resultListenerId
            },
            dialogTitle,
            'kix-icon-link'
        );
        DialogService.getInstance()
            .registerDialogResultListener<CreateLinkDescription[][]>(
                resultListenerId, 'object-link', this.linksChanged.bind(this)
            );
    }

    private linksChanged(result: CreateLinkDescription[][]): void {
        this.linkDescriptionsForCreate = [...this.linkDescriptionsForCreate, ...result[1]];
        this.linkDescriptions = result[0];
        this.updateTable(result[1]);
        this.highlightNewLinkObjects();
    }

    private updateTable(newLinkDescriptions): void {
        if (newLinkDescriptions.length) {
            const newLinkObjects: LinkObject[] = newLinkDescriptions.map((ld) => {
                const service =
                    KIXObjectServiceRegistry.getInstance().getServiceInstance(ld.linkableObject.KIXObjectType);
                return new LinkObject({
                    ObjectId: ld.linkTypeDescription.linkType.TypeID,
                    linkedObjectKey: ld.linkableObject.ObjectId,
                    linkedObjectType: ld.linkableObject.KIXObjectType,
                    title: service.getDetailsTitle(ld.linkableObject),
                    linkedAs: ld.linkTypeDescription.asSource ?
                        ld.linkTypeDescription.linkType.SourceName : ld.linkTypeDescription.linkType.TargetName,
                    isSource: ld.linkTypeDescription.asSource
                } as LinkObject);
            });
            this.allLinkObjects = [...this.allLinkObjects, ...newLinkObjects];
            this.newLinkObjects = [...this.newLinkObjects, ...newLinkObjects];
            this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(this.allLinkObjects);
            this.state.table.loadRows(true);
            this.state.linkObjectCount = this.allLinkObjects.length;
        }
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(true, "Verknüpfungen werden aktualisiert.");
        setTimeout(() => {
            this.showSuccessHint();
            DialogService.getInstance().closeMainDialog();
            DialogService.getInstance().setMainDialogLoading(false);
        }, 1500);
    }

    private showSuccessHint(): void {
        const content = new ComponentContent('list-with-title', {
            title: 'Verknüpfungen aktualisiert.',
            list: [],
            icon: 'kix-icon-check'
        });
        OverlayService.getInstance().openOverlay(OverlayType.TOAST, null, content, '');
    }

    private showError(error: any): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }

    public highlightNewLinkObjects(): void {
        this.highlightLayer.setHighlightedObjects(this.newLinkObjects);
    }

}

module.exports = Component;
