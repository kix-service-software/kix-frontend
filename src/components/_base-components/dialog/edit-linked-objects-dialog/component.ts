import { ComponentState } from './ComponentState';
import {
    DialogService, OverlayService,
    ContextService, StandardTableFactoryService, ITableHighlightLayer,
    TableHighlightLayer, LabelService, ServiceRegistry, SearchOperator,
    ITablePreventSelectionLayer, TablePreventSelectionLayer, IKIXObjectService, KIXObjectService
} from '@kix/core/dist/browser';
import {
    ComponentContent, OverlayType, StringContent,
    KIXObject, LinkObject, KIXObjectType,
    CreateLinkDescription, KIXObjectPropertyFilter, TableFilterCriteria,
    LinkObjectProperty, LinkTypeDescription, CreateLinkObjectOptions,
    ToastContent, LinkType, ContextType, SortUtil, DataType, KIXObjectCache
} from '@kix/core/dist/model';
import { LinkUtil } from '@kix/core/dist/browser/link';

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

    private textFilter: string;
    private propertyFilter: KIXObjectPropertyFilter;

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
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        if (context) {
            this.mainObject = await context.getObject();

            this.availableLinkObjects = await LinkUtil.getLinkObjects(this.mainObject);
            this.availableLinkObjects.sort((a, b) => {
                return SortUtil.compareValues(a.linkedObjectType, b.linkedObjectType, DataType.STRING);
            });
            this.state.linkObjectCount = this.availableLinkObjects.length;

            await this.reviseLinkObjects();
            await this.setInitialLinkDescriptions();
            await this.prepareTable();
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
        await this.initPredefinedFilter();
    }

    private async prepareLinkedObjects(linkedObjectIds: Map<KIXObjectType, string[]>): Promise<void> {
        const iterator = linkedObjectIds.entries();
        let objectIds = iterator.next();
        while (objectIds && objectIds.value) {
            if (objectIds.value[1].length) {
                const objects = await KIXObjectService.loadObjects(
                    objectIds.value[0], objectIds.value[1], null
                );
                this.linkedObjects = [...this.linkedObjects, ...objects];
            }

            objectIds = iterator.next();
        }

        for (const o of this.linkedObjects) {
            const linkObject = this.availableLinkObjects.find(
                (lo) => lo.linkedObjectType === o.KIXObjectType && lo.linkedObjectKey === o.ObjectId.toString()
            );
            if (linkObject) {
                linkObject.linkedObjectDisplayId = await LabelService.getInstance().getText(o, true, false);
                linkObject.title = await LabelService.getInstance().getText(o, false, true);
            }
        }
    }

    private async initPredefinedFilter(): Promise<void> {
        if (this.mainObject) {
            const linkPartners = await LinkUtil.getPossibleLinkPartners(this.mainObject.KIXObjectType);

            linkPartners.forEach((lp) => {
                const labelProvider = LabelService.getInstance().getLabelProviderForType(lp[1]);
                const icon = labelProvider ? labelProvider.getObjectIcon(null) : null;
                this.state.predefinedTableFilter.push(
                    new KIXObjectPropertyFilter(lp[0].toString(), [
                        new TableFilterCriteria(
                            LinkObjectProperty.LINKED_OBJECT_TYPE,
                            SearchOperator.EQUALS,
                            lp[1].toString()
                        )
                    ], icon),
                );
            });
        }
    }

    private async setInitialLinkDescriptions(): Promise<void> {

        const linkTypes = await KIXObjectService.loadObjects<LinkType>(KIXObjectType.LINK_TYPE)
            .catch((error) => [] as LinkType[]);

        this.availableLinkObjects.forEach((lo) => {
            const linkedObject = this.linkedObjects.find(
                (ldo) => ldo.ObjectId.toString() === lo.linkedObjectKey && ldo.KIXObjectType === lo.linkedObjectType
            );

            if (linkedObject) {
                const link = this.mainObject.Links.find((l) => l.ID === lo.ObjectId);
                if (link) {
                    const linkType = linkTypes.find(
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

    private async prepareTable(): Promise<void> {
        this.state.table = null;

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
        this.preventSelectionLayer.setPreventSelectionFilter([...this.deleteLinkObjects]);

        table.layerConfiguration.contentLayer.setPreloadedObjects(this.availableLinkObjects);

        table.setFilterSettings(this.textFilter, this.propertyFilter);

        await table.loadRows(true);
        table.listenerConfiguration.selectionListener.addListener(
            this.objectSelectionChanged.bind(this)
        );

        setTimeout(() => {
            this.state.table = table;
        }, 50);
    }

    public objectSelectionChanged(newSelectedLinkObjects: LinkObject[]): void {
        this.selectedLinkObjects = newSelectedLinkObjects;
        this.state.canDelete = !!this.selectedLinkObjects.length;
    }

    public async filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): Promise<void> {
        this.textFilter = textFilterValue;
        this.propertyFilter = filter;
        await this.state.table.setFilterSettings(textFilterValue, filter);
    }

    public async markToDelete(): Promise<void> {
        this.selectedLinkObjects.forEach((slo) => {
            const newLinkIndex = this.newLinkObjects.findIndex((nlo) => nlo.equals(slo));
            if (newLinkIndex !== -1) {
                this.newLinkObjects.splice(newLinkIndex, 1);
                const index = this.availableLinkObjects.findIndex((alo) => alo.equals(slo));
                if (index !== -1) {
                    this.availableLinkObjects.splice(index, 1);
                }
            } else {
                if (!this.deleteLinkObjects.some((dlo) => dlo.equals(slo))) {
                    this.deleteLinkObjects.push(slo);
                }
            }
        });

        await this.prepareTable();

        this.state.canDelete = false;
        this.setCanSubmit();
    }

    public openAddLinkDialog(): void {
        let dialogTitle = 'Objekt verknüpfen';
        const labelProvider = LabelService.getInstance().getLabelProviderForType(this.mainObject.KIXObjectType);
        if (labelProvider) {
            dialogTitle = `${labelProvider.getObjectName()} verknüpfen`;
        }

        const linkDescriptions = this.linkDescriptions.filter((ld) => !this.deleteLinkObjects
            .some((dlo) =>
                dlo.linkedObjectType === ld.linkableObject.KIXObjectType &&
                dlo.linkedObjectKey.toString() === ld.linkableObject.ObjectId.toString()
            )
        );

        const resultListenerId = 'result-listener-link-' + this.mainObject.KIXObjectType + '-edit-links';
        DialogService.getInstance().openOverlayDialog(
            'link-object-dialog',
            {
                linkDescriptions,
                objectType: this.mainObject.KIXObjectType,
                resultListenerId
            },
            dialogTitle,
            'kix-icon-new-link'
        );
        DialogService.getInstance()
            .registerDialogResultListener<CreateLinkDescription[][]>(
                resultListenerId, 'object-link', this.linksChanged.bind(this)
            );
    }

    private async linksChanged(result: CreateLinkDescription[][]): Promise<void> {
        this.linkDescriptions = result[0];
        await this.addNewLinks(result[1]);
        this.setCanSubmit();
    }

    private async addNewLinks(newLinkDescriptions): Promise<void> {
        if (newLinkDescriptions.length) {
            const newLinkObjects: LinkObject[] = [];

            for (const ld of newLinkDescriptions) {
                newLinkObjects.push(new LinkObject({
                    ObjectId: 'NEW-' + ld.linkableObject.KIXObjectType + '-' +
                        ld.linkableObject.ObjectId + '-' + ld.linkTypeDescription.linkType.TypeID,
                    linkedObjectKey: ld.linkableObject.ObjectId,
                    linkedObjectDisplayId: await LabelService.getInstance().getText(ld.linkableObject, true, false),
                    linkedObjectType: ld.linkableObject.KIXObjectType,
                    title: await LabelService.getInstance().getText(ld.linkableObject, false, true),
                    linkedAs: ld.linkTypeDescription.asSource ?
                        ld.linkTypeDescription.linkType.SourceName : ld.linkTypeDescription.linkType.TargetName,
                    linkType: ld.linkTypeDescription.linkType,
                    isSource: ld.linkTypeDescription.asSource
                } as LinkObject));
            }

            this.availableLinkObjects = [...this.availableLinkObjects, ...newLinkObjects];
            this.newLinkObjects = [...this.newLinkObjects, ...newLinkObjects];

            await this.prepareTable();

            this.state.linkObjectCount = this.availableLinkObjects.length;

            const filter = (this as any).getComponent('edit-linked-objects-filter');
            if (filter) {
                filter.reset();
            }
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
                KIXObjectCache.removeObject(dlo.KIXObjectType, dlo.ObjectId);
            }
        });

        KIXObjectCache.removeObject(this.mainObject.KIXObjectType, this.mainObject.ObjectId);

        let deleteLinksOK: boolean = true;
        if (!!linkIdsToDelete.length) {
            deleteLinksOK = await this.deleteLinks(linkIdsToDelete);
        }

        let createLinksOK: boolean = true;
        if (deleteLinksOK && !!this.newLinkObjects.length) {
            createLinksOK = await this.addLinks();
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
        const service = ServiceRegistry.getInstance().getServiceInstance<IKIXObjectService>(KIXObjectType.LINK_OBJECT);
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
        const service
            = ServiceRegistry.getInstance().getServiceInstance<IKIXObjectService>(KIXObjectType.LINK);
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
        const content = new ComponentContent(
            'toast',
            new ToastContent('Verknüpfungen aktualisiert.', 'kix-icon-check')
        );
        OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
    }

    private showError(error: any): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }
}

module.exports = Component;
