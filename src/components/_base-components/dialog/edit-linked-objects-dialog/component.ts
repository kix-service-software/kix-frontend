import { ComponentState } from './ComponentState';
import {
    DialogService, OverlayService,
    ContextService, StandardTableFactoryService, ITableHighlightLayer,
    TableHighlightLayer, LabelService, KIXObjectServiceRegistry, SearchOperator,
    ITablePreventSelectionLayer, TablePreventSelectionLayer
} from '@kix/core/dist/browser';
import {
    ComponentContent, OverlayType, StringContent,
    Link, KIXObject, LinkObject, KIXObjectType,
    CreateLinkDescription, KIXObjectPropertyFilter, TableFilterCriteria,
    LinkObjectProperty, LinkTypeDescription, LinkType, CreateLinkObjectOptions
} from '@kix/core/dist/model';
import { LinkService, LinkUtil } from '@kix/core/dist/browser/link';

class Component {

    private state: ComponentState;
    private mainObject: KIXObject = null;
    private availableLinkObjects: LinkObject[] = [];
    private newLinkObjects: LinkObject[] = [];
    private deleteLinkObjects: LinkObject[] = [];
    private selectedLinkObjects: LinkObject[] = [];
    private linkedObjects: KIXObject[] = [];
    private linkDescriptions: CreateLinkDescription[] = [];
    private newObjectsHighlightLayer: ITableHighlightLayer;
    private removeObjectsHighlightLayer: ITableHighlightLayer;
    private preventSelectionLayer: ITablePreventSelectionLayer;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.mainObject = null;
        this.availableLinkObjects = [];
        this.newLinkObjects = [];
        this.deleteLinkObjects = [];
        this.selectedLinkObjects = [];
        this.linkedObjects = [];
        this.linkDescriptions = [];
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            this.mainObject = await context.getObject();

            this.availableLinkObjects = LinkUtil.getLinkObjects(this.mainObject);
            this.state.linkObjectCount = this.availableLinkObjects.length;

            await this.reviseLinkObjects();
            this.setInitialLinkDescriptions();
            this.prepareTable();
        }
        this.state.loading = false;
    }

    private async reviseLinkObjects(): Promise<void> {
        const linkedObjectIds: Map<KIXObjectType, string[]> = new Map();
        this.availableLinkObjects.forEach((lo) => {
            if (linkedObjectIds.has(lo.linkedObjectType)) {
                if (linkedObjectIds.get(lo.linkedObjectType).findIndex((id) => id === lo.linkedObjectKey) === -1) {
                    linkedObjectIds.get(lo.linkedObjectType).push(lo.linkedObjectKey);
                }
            } else {
                linkedObjectIds.set(lo.linkedObjectType, [lo.linkedObjectKey]);
            }
        });
        await this.prepareLinkedObjects(linkedObjectIds);
        this.initPredefinedFilter(linkedObjectIds);
    }

    private async prepareLinkedObjects(linkedObjectIds: Map<KIXObjectType, string[]>): Promise<void> {
        const iterator = linkedObjectIds.entries();
        let objectIds = iterator.next();
        while (objectIds && objectIds.value) {
            const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(objectIds.value[0]);
            if (service && objectIds.value[1].length) {
                const objects = await service.loadObjects(
                    objectIds.value[0], objectIds.value[1], null
                );
                this.linkedObjects = [...this.linkedObjects, ...objects];
            }

            objectIds = iterator.next();
        }

        this.linkedObjects.forEach((o) => {
            const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(o.KIXObjectType);
            const linkObject = this.availableLinkObjects.find(
                (lo) => lo.linkedObjectType === o.KIXObjectType && lo.linkedObjectKey === o.ObjectId.toString()
            );
            if (linkObject) {
                linkObject.title = service.getDetailsTitle(o);
            }
        });
    }

    private initPredefinedFilter(linkedObjectIds: Map<KIXObjectType, string[]>): void {
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
        this.availableLinkObjects.forEach((lo) => {
            const linkedObject = this.linkedObjects.find(
                (ldo) => ldo.ObjectId.toString() === lo.linkedObjectKey && ldo.KIXObjectType === lo.linkedObjectType
            );
            const objectData = ContextService.getInstance().getObjectData();
            if (linkedObject && objectData) {
                const link = this.mainObject.Links.find((l) => l.ID === lo.ObjectId);
                if (link) {
                    const linkType = objectData.linkTypes.find(
                        (lt) => LinkUtil.isLinkType(lt, link, lo, this.mainObject)
                    );
                    if (linkType) {
                        this.linkDescriptions.push(
                            new CreateLinkDescription(linkedObject, new LinkTypeDescription(linkType, lo.isSource))
                        );
                    }
                }
            }
        });
    }

    private prepareTable(): void {
        const table = StandardTableFactoryService.getInstance().createStandardTable(
            KIXObjectType.LINK_OBJECT
        );

        this.newObjectsHighlightLayer = new TableHighlightLayer();
        table.addAdditionalLayerOnTop(this.newObjectsHighlightLayer);
        this.newObjectsHighlightLayer.setHighlightedObjects(this.newLinkObjects);

        this.removeObjectsHighlightLayer = new TableHighlightLayer('link-object-to-delete');
        table.addAdditionalLayerOnTop(this.removeObjectsHighlightLayer);
        this.removeObjectsHighlightLayer.setHighlightedObjects(this.deleteLinkObjects);

        this.preventSelectionLayer = new TablePreventSelectionLayer();
        table.addAdditionalLayerOnTop(this.preventSelectionLayer);
        this.preventSelectionLayer.setPreventSelectionFilter([...this.deleteLinkObjects, ...this.newLinkObjects]);

        table.layerConfiguration.contentLayer.setPreloadedObjects(this.availableLinkObjects);
        table.loadRows(true);
        table.listenerConfiguration.selectionListener.addListener(
            this.objectSelectionChanged.bind(this)
        );

        this.state.table = table;
    }

    public objectSelectionChanged(newSelectedLinkObjects: LinkObject[]): void {
        this.selectedLinkObjects = newSelectedLinkObjects;
        this.state.canDelete = !!this.selectedLinkObjects.length;
    }

    public filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        this.state.table.setFilterSettings(textFilterValue, filter);
    }

    public markToDelete(): void {
        this.selectedLinkObjects.forEach((slo) => {
            if (!this.deleteLinkObjects.some((dlo) => dlo.equals(slo))) {
                this.deleteLinkObjects.push(slo);
            }
        });

        this.prepareTable();

        this.state.canDelete = false;
        this.setCanSubmit();
    }

    public openAddLinkDialog(): void {
        let dialogTitle = 'Objekt verknüpfen';
        const labelProvider = LabelService.getInstance().getLabelProviderForType(this.mainObject.KIXObjectType);
        if (labelProvider) {
            dialogTitle = `${labelProvider.getObjectName(false)} verknüpfen`;
        }
        const resultListenerId = 'result-listener-link-' + this.mainObject.KIXObjectType + '-edit-links';
        DialogService.getInstance().openOverlayDialog(
            'link-object-dialog',
            {
                linkDescriptions: this.linkDescriptions,
                objectType: this.mainObject.KIXObjectType,
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
        this.linkDescriptions = result[0];
        this.addNewLinks(result[1]);
        this.setCanSubmit();
    }

    private addNewLinks(newLinkDescriptions): void {
        if (newLinkDescriptions.length) {
            const newLinkObjects: LinkObject[] = newLinkDescriptions.map((ld: CreateLinkDescription) => {
                const service =
                    KIXObjectServiceRegistry.getInstance().getServiceInstance(ld.linkableObject.KIXObjectType);
                return new LinkObject({
                    ObjectId: 'NEW-' + ld.linkableObject.KIXObjectType + '-' +
                        ld.linkableObject.ObjectId + '-' + ld.linkTypeDescription.linkType.TypeID,
                    linkedObjectKey: ld.linkableObject.ObjectId,
                    linkedObjectType: ld.linkableObject.KIXObjectType,
                    title: service.getDetailsTitle(ld.linkableObject),
                    linkedAs: ld.linkTypeDescription.asSource ?
                        ld.linkTypeDescription.linkType.SourceName : ld.linkTypeDescription.linkType.TargetName,
                    linkType: ld.linkTypeDescription.linkType,
                    isSource: ld.linkTypeDescription.asSource
                } as LinkObject);
            });
            this.availableLinkObjects = [...this.availableLinkObjects, ...newLinkObjects];
            this.newLinkObjects = [...this.newLinkObjects, ...newLinkObjects];

            this.prepareTable();

            this.state.linkObjectCount = this.availableLinkObjects.length;
        }
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    private setCanSubmit(): void {
        this.state.canSubmit = !!this.deleteLinkObjects.length || !!this.newLinkObjects.length;
    }

    public async submit(): Promise<void> {
        const linkIdsToDelete: number[] = [];
        this.deleteLinkObjects.forEach((dlo) => {
            const newLinkObjectIndex = this.newLinkObjects.findIndex((nlo) => nlo.equals(dlo));
            if (newLinkObjectIndex !== -1) {
                this.newLinkObjects.splice(newLinkObjectIndex, 1);
            } else {
                linkIdsToDelete.push(Number(dlo.ObjectId));
            }
        });

        let createLinksOK: boolean = true;
        if (!!this.newLinkObjects.length) {
            createLinksOK = await this.addLinks();
        }
        let deleteLinksOK: boolean = true;
        if (createLinksOK && !!linkIdsToDelete.length) {
            deleteLinksOK = await this.deleteLinks(linkIdsToDelete);
        }

        DialogService.getInstance().setMainDialogLoading(false);
        if (createLinksOK && deleteLinksOK) {
            this.showSuccessHint();
            DialogService.getInstance().closeMainDialog();
            const activeContext = ContextService.getInstance().getActiveContext();
            if (activeContext) {
                activeContext.getObject(null, true);
            }
        }
    }

    private async addLinks(): Promise<boolean> {
        const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(KIXObjectType.LINK_OBJECT);
        DialogService.getInstance().setMainDialogLoading(true, "Verknüpfungen werden angelegt.");
        let ok = true;
        for (const newLinkObject of this.newLinkObjects) {
            await service.createObject(
                KIXObjectType.LINK_OBJECT,
                newLinkObject,
                new CreateLinkObjectOptions(this.mainObject)
            ).catch((error) => {
                this.showError('Verknüpfung nicht anlegbar (' + error + ')');
                ok = false;
                return;
            });
        }
        return ok;
    }

    private async deleteLinks(linkIdsToDelete: number[]): Promise<boolean> {
        const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(KIXObjectType.LINK);
        DialogService.getInstance().setMainDialogLoading(true, "Verknüpfungen werden entfernt.");
        let ok = true;
        for (const linkId of linkIdsToDelete) {
            await service.deleteObject(KIXObjectType.LINK_OBJECT, linkId).catch((error) => {
                this.showError('Verknüpfung nicht entfernbar (' + error + ')');
                ok = false;
                return;
            });
        }
        return ok;
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
}

module.exports = Component;
