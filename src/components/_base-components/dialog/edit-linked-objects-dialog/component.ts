import { ComponentState } from './ComponentState';
import {
    DialogService, ContextService, LabelService, ServiceRegistry, SearchOperator,
    IKIXObjectService, KIXObjectService, BrowserUtil, TableFactoryService, TableEvent, ValueState, TableEventData
} from '../../../../core/browser';
import {
    KIXObject, LinkObject, KIXObjectType, CreateLinkDescription, KIXObjectPropertyFilter, TableFilterCriteria,
    LinkObjectProperty, LinkTypeDescription, CreateLinkObjectOptions, LinkType, ContextType,
    SortUtil, DataType, KIXObjectCache
} from '../../../../core/model';
import { LinkUtil, EditLinkedObjectsDialogContext } from '../../../../core/browser/link';
import { IEventSubscriber, EventService } from '../../../../core/browser/event';

class Component {

    private state: ComponentState;
    private mainObject: KIXObject = null;
    private availableLinkObjects: LinkObject[] = [];
    private newLinkObjects: LinkObject[] = [];
    private deleteLinkObjects: LinkObject[] = [];
    private selectedLinkObjects: LinkObject[] = [];
    private linkedObjects: KIXObject[] = [];
    private linkDescriptions: CreateLinkDescription[] = [];

    private tableSubscriber: IEventSubscriber;
    private linkDialogListenerId: string;

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

            const editLinksContext = await ContextService.getInstance().getContext<EditLinkedObjectsDialogContext>(
                EditLinkedObjectsDialogContext.CONTEXT_ID
            );
            editLinksContext.setObjectList(this.availableLinkObjects);

            await this.prepareTable();

            this.linkDialogListenerId = 'result-listener-link-' + this.mainObject.KIXObjectType + '-edit-links';
            DialogService.getInstance()
                .registerDialogResultListener<CreateLinkDescription[][]>(
                    this.linkDialogListenerId, 'object-link', this.linksChanged.bind(this)
                );
        }
        this.state.loading = false;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);

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

        const linkTypes = await KIXObjectService.loadObjects<LinkType>(KIXObjectType.LINK_TYPE, null, null, null, false)
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

        const table = TableFactoryService.getInstance().createTable(
            'edit-linked-objects-dialog', KIXObjectType.LINK_OBJECT,
            null, null, EditLinkedObjectsDialogContext.CONTEXT_ID
        );

        this.tableSubscriber = {
            eventSubscriberId: 'edit-link-object-dialog',
            eventPublished: (data: TableEventData, eventId: string) => {
                if (data && data.tableId === table.getTableId()) {
                    if (eventId === TableEvent.ROW_SELECTION_CHANGED) {
                        this.objectSelectionChanged(table.getSelectedRows().map((r) => r.getRowObject().getObject()));
                    }
                    if (eventId === TableEvent.TABLE_READY) {
                        this.state.table.setRowObjectValueState(this.newLinkObjects, ValueState.HIGHLIGHT_SUCCESS);
                    }
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);

        this.state.table = table;
    }

    public objectSelectionChanged(newSelectedLinkObjects: LinkObject[]): void {
        this.selectedLinkObjects = newSelectedLinkObjects;
        this.state.canDelete = !!this.selectedLinkObjects.length;
    }

    public async filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): Promise<void> {
        this.state.table.setFilter(textFilterValue, filter ? filter.criteria : []);
        this.state.table.filter();
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

        DialogService.getInstance().openOverlayDialog(
            'link-object-dialog',
            {
                linkDescriptions,
                objectType: this.mainObject.KIXObjectType,
                resultListenerId: this.linkDialogListenerId,
                rootObject: this.mainObject
            },
            dialogTitle,
            'kix-icon-new-link'
        );
    }

    private async linksChanged(result: CreateLinkDescription[][]): Promise<void> {
        this.linkDescriptions = result[0];
        await this.addNewLinks(result[1]);
        this.setCanSubmit();
    }

    private async addNewLinks(newLinkDescriptions: CreateLinkDescription[]): Promise<void> {
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

            const context = await ContextService.getInstance().getContext<EditLinkedObjectsDialogContext>(
                EditLinkedObjectsDialogContext.CONTEXT_ID
            );
            context.setObjectList([...this.availableLinkObjects]);
            context.getObjectList();

            this.state.linkObjectCount = this.availableLinkObjects.length;

            const filter = (this as any).getComponent('edit-linked-objects-filter');
            if (filter) {
                filter.reset();
            }
        }
    }

    public async markToDelete(): Promise<void> {
        let deleteNewLinks: LinkObject[] = [];
        this.selectedLinkObjects.forEach((slo) => {
            const newLinkIndex = this.newLinkObjects.findIndex((nlo) => nlo.equals(slo));
            if (newLinkIndex !== -1) {
                this.newLinkObjects.splice(newLinkIndex, 1);
                const index = this.availableLinkObjects.findIndex((alo) => alo.equals(slo));
                if (index !== -1) {
                    deleteNewLinks = [...deleteNewLinks, ...this.availableLinkObjects.splice(index, 1)];
                }
            } else {
                if (!this.deleteLinkObjects.some((dlo) => dlo.equals(slo))) {
                    this.deleteLinkObjects.push(slo);
                }
            }
        });

        if (!!deleteNewLinks.length) {
            this.state.table.removeRows(
                this.state.table.getRows().filter(
                    (r) => deleteNewLinks.some(
                        (dl) => dl.equals(r.getRowObject().getObject())
                    )
                ).map((r) => r.getRowId())
            );
        }

        this.state.table.setRowsSelectableByObject(this.deleteLinkObjects, false);
        this.state.table.setRowObjectValueState(this.deleteLinkObjects, ValueState.HIGHLIGHT_REMOVED);

        this.state.canDelete = false;
        this.setCanSubmit();
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
            BrowserUtil.openSuccessOverlay('Verknüpfungen aktualisiert.');
            DialogService.getInstance().submitMainDialog();
            const activeContext = ContextService.getInstance().getActiveContext();
            if (activeContext) {
                activeContext.getObject(null, true);
            }
        }
    }

    private async addLinks(): Promise<boolean> {
        const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(KIXObjectType.LINK_OBJECT);
        DialogService.getInstance().setMainDialogLoading(true, "Verknüpfungen werden angelegt.");
        let ok = true;
        for (const newLinkObject of this.newLinkObjects) {
            await service.createObject(
                KIXObjectType.LINK_OBJECT,
                newLinkObject,
                new CreateLinkObjectOptions(this.mainObject)
            ).catch((error) => {
                BrowserUtil.openErrorOverlay('Verknüpfung nicht anlegbar (' + error + ')');
                ok = false;
                return;
            });
        }
        return ok;
    }

    private async deleteLinks(linkIdsToDelete: number[]): Promise<boolean> {
        DialogService.getInstance().setMainDialogLoading(true, "Verknüpfungen werden entfernt.");
        const failIds = await KIXObjectService.deleteObject(KIXObjectType.LINK_OBJECT, linkIdsToDelete);
        return !failIds || !!!failIds.length;
    }

}

module.exports = Component;
