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
    private deleteLinkObjects: LinkObject[] = [];
    private linkedObjects: KIXObject[] = [];
    private linkDescriptions: CreateLinkDescription[] = [];
    private linkDescriptionsForCreate: CreateLinkDescription[] = [];
    private highlightLayerForNew: ITableHighlightLayer;
    private highlightLayerForDelete: ITableHighlightLayer;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.linkRootObject = null;
        this.links = [];
        this.allLinkObjects = [];
        this.newLinkObjects = [];
        this.deleteLinkObjects = [];
        this.linkedObjects = [];
        this.linkDescriptions = [];
        this.linkDescriptionsForCreate = [];
    }

    public async onMount(): Promise<void> {
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

            if (this.state.table) {
                this.highlightLayerForNew = new TableHighlightLayer();
                this.state.table.addAdditionalLayerOnTop(this.highlightLayerForNew);
                this.highlightLayerForDelete = new TableHighlightLayer('link-object-to-delete');
                this.state.table.addAdditionalLayerOnTop(this.highlightLayerForDelete);

                this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(this.allLinkObjects);
                this.state.table.loadRows(true);
                this.highlightNewLinkObjects();
                this.state.table.listenerConfiguration.selectionListener.addListener(
                    this.objectSelectionChanged.bind(this)
                );
            }
            this.state.linkObjectCount = this.allLinkObjects.length;
        }
    }

    private async prepareLinkObjects(): Promise<void> {
        const objectData = ContextService.getInstance().getObjectData();
        if (this.links && this.links.length && objectData) {

            this.allLinkObjects = this.links.map((l: Link) => {
                const linkObject: LinkObject = new LinkObject();
                const linkType = objectData.linkTypes.find((lt) => lt.Name === l.Type);
                if (
                    l.SourceObject === this.linkRootObject.KIXObjectType &&
                    l.SourceKey.toString() === this.linkRootObject.ObjectId.toString()
                ) {
                    linkObject.ObjectId = l.ObjectId || l.ID;
                    linkObject.linkedObjectKey = l.TargetKey.toString();
                    linkObject.linkedObjectType = l.TargetObject as KIXObjectType;
                    linkObject.linkedAs = linkType.TargetName;
                    linkObject.linkType = linkType;
                } else {
                    linkObject.ObjectId = l.ObjectId || l.ID;
                    linkObject.linkedObjectKey = l.SourceKey.toString();
                    linkObject.linkedObjectType = l.SourceObject as KIXObjectType;
                    linkObject.linkedAs = linkType.SourceName;
                    linkObject.linkType = linkType;
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
        this.allLinkObjects.forEach((lo) => {
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
                    this.linkDescriptions.push(
                        new CreateLinkDescription(linkedObject, new LinkTypeDescription(linkType, lo.isSource))
                    );
                }
            }
        });
    }

    public objectSelectionChanged(selectedLinkObjects: LinkObject[]): void {
        this.deleteLinkObjects = selectedLinkObjects;
    }

    public filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        this.state.table.setFilterSettings(textFilterValue, filter);
    }

    public markToDelete(): void {
        const deleteNewLinkObject: LinkObject[] = [];
        this.deleteLinkObjects.forEach((dlo) => {
            const index = this.newLinkObjects.findIndex((nlo) => nlo.equals(dlo));
            if (index !== -1) {
                deleteNewLinkObject.push(dlo);
                this.newLinkObjects.splice(index, 1);
            }
        });

        this.updateDescriptions(deleteNewLinkObject);
        this.updateTableForDelete(deleteNewLinkObject);
    }

    private updateDescriptions(deleteNewLinkObject: LinkObject[]): void {
        this.linkDescriptionsForCreate = this.linkDescriptionsForCreate.filter(
            (ldfc) => !deleteNewLinkObject.some(
                (dlo) => dlo.linkedObjectKey === ldfc.linkableObject.ObjectId &&
                    dlo.linkedObjectType === ldfc.linkableObject.KIXObjectType &&
                    dlo.linkType.TypeID === ldfc.linkTypeDescription.linkType.TypeID
            )
        );
        this.linkDescriptions = this.linkDescriptions.filter(
            (ldfc) => !deleteNewLinkObject.some(
                (dlo) => dlo.linkedObjectKey === ldfc.linkableObject.ObjectId &&
                    dlo.linkedObjectType === ldfc.linkableObject.KIXObjectType &&
                    dlo.linkType.TypeID === ldfc.linkTypeDescription.linkType.TypeID
            )
        );
    }

    private updateTableForDelete(deleteNewLinkObject: LinkObject[]): void {
        this.deleteLinkObjects = this.deleteLinkObjects.filter(
            (dlo) => !deleteNewLinkObject.some((dnlo) => dnlo.equals(dlo))
        );
        this.allLinkObjects = this.allLinkObjects.filter(
            (alo) => !deleteNewLinkObject.some((dnlo) => dnlo.equals(alo))
        );
        this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(this.allLinkObjects);
        this.state.table.loadRows(true);
        this.highlightDeleteLinkObjects();
    }

    private highlightDeleteLinkObjects(): void {
        this.highlightLayerForDelete.setHighlightedObjects(this.deleteLinkObjects);
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
        this.updateTableForNew(result[1]);
    }

    private updateTableForNew(newLinkDescriptions): void {
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
            this.allLinkObjects = [...this.allLinkObjects, ...newLinkObjects];
            this.newLinkObjects = [...this.newLinkObjects, ...newLinkObjects];
            this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(this.allLinkObjects);
            this.state.table.loadRows(true);
            this.state.linkObjectCount = this.allLinkObjects.length;
        }
        this.highlightNewLinkObjects();
    }

    private highlightNewLinkObjects(): void {
        this.highlightLayerForNew.setHighlightedObjects(this.newLinkObjects);
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        // DialogService.getInstance().setMainDialogLoading(true, "Verknüpfungen werden aktualisiert.");
        // const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(KIXObjectType.LINK);

        // let everythingOK: boolean = true;
        // const errors: Error[] = [];
        // for (const linkDesc of this.linkDescriptionsForCreate) {
        //     await service.createObject(KIXObjectType.LINK, faqVote, new CreateFAQVoteOptions(this.faqArticle.ID))
        //         .catch((error) => {
        //             everythingOK = false;
        //             errors.push(error);
        //         });

        // }
        // if (everythingOK) {
        //     this.showSuccessHint();
        //     DialogService.getInstance().closeMainDialog();
        //     DialogService.getInstance().setMainDialogLoading(false);
        // } else {
        //     DialogService.getInstance().setMainDialogLoading(false);
        //     OverlayService.getInstance().openOverlay(
        //         OverlayType.WARNING, null, new StringContent(errors.join(',')), 'Fehler!', true
        //     );
        // }
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
