/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { LinkObject } from '../../../model/LinkObject';
import { CreateLinkDescription } from '../../../server/api/CreateLinkDescription';
import { IEventSubscriber } from '../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { AuthenticationSocketClient } from '../../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { LinkUtil, EditLinkedObjectsDialogContext } from '../../core';
import { SortUtil } from '../../../../../model/SortUtil';
import { DataType } from '../../../../../model/DataType';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { LinkType } from '../../../model/LinkType';
import { LinkTypeDescription } from '../../../model/LinkTypeDescription';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { CreateLinkObjectOptions } from '../../../server/api/CreateLinkObjectOptions';
import { Error } from '../../../../../../../server/model/Error';
import { IKIXObjectService } from '../../../../../modules/base-components/webapp/core/IKIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { Context } from '../../../../../model/Context';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { TableEvent } from '../../../../table/model/TableEvent';
import { TableEventData } from '../../../../table/model/TableEventData';
import { ValueState } from '../../../../table/model/ValueState';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';

class Component {

    private state: ComponentState;
    private availableLinkObjects: LinkObject[] = [];
    private newLinkObjects: LinkObject[] = [];
    private deleteLinkObjects: LinkObject[] = [];
    private selectedLinkObjects: LinkObject[] = [];
    private linkedObjects: KIXObject[] = [];
    private linkDescriptions: CreateLinkDescription[] = [];

    private tableSubscriber: IEventSubscriber;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.availableLinkObjects = [];
        this.newLinkObjects = [];
        this.deleteLinkObjects = [];
        this.selectedLinkObjects = [];
        this.linkedObjects = [];
        this.linkDescriptions = [];
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Cancel', 'Translatable#Assign Link', 'Translatable#Delete Link', 'Translatable#Submit'
        ]);

        this.state.allowCreate = await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission('links', [CRUD.CREATE])]
        );

        this.state.allowDelete = this.state.allowCreate;

        const context = ContextService.getInstance().getActiveContext();
        let sourceContext: Context;

        const sourceContextInformation = context?.getAdditionalInformation(AdditionalContextInformation.SOURCE_CONTEXT);
        if (sourceContextInformation) {
            sourceContext = ContextService.getInstance().getContext(sourceContextInformation?.instanceId);
        }

        const contextObject = await sourceContext?.getObject();
        const text = await TranslationService.translate('Translatable#Edit Links');
        this.state.title = text + ' - ' + await sourceContext?.getDisplayText();

        if (contextObject) {
            const objects = await KIXObjectService.loadObjects(
                contextObject.KIXObjectType, [contextObject.ObjectId],
                new KIXObjectLoadingOptions(null, null, null, [KIXObjectProperty.LINKS], [KIXObjectProperty.LINKS])
            );

            if (objects && objects.length) {
                this.state.mainObject = objects[0];

                this.availableLinkObjects = await LinkUtil.getLinkObjects(this.state.mainObject);
                this.availableLinkObjects.sort((a, b) => {
                    return SortUtil.compareValues(a.linkedObjectType, b.linkedObjectType, DataType.STRING);
                });
                this.state.linkObjectCount = this.availableLinkObjects.length;

                await this.reviseLinkObjects();
                await this.setInitialLinkDescriptions();

                const editLinksContext = ContextService.getInstance().getActiveContext();
                editLinksContext.setObjectList(KIXObjectType.LINK_OBJECT, this.availableLinkObjects);

                await this.prepareTable();

                this.setLinkDescriptions();
            }
        }

        this.state.loading = false;
    }

    private setLinkDescriptions(): void {
        this.state.linkDescriptions = this.linkDescriptions.filter((ld) => !this.deleteLinkObjects
            .some((dlo) =>
                dlo.linkedObjectType === ld.linkableObject.KIXObjectType &&
                dlo.linkedObjectKey.toString() === ld.linkableObject.ObjectId.toString()
            )
        );
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_FILTERED, this.tableSubscriber);
    }

    public async linksAdded(result: CreateLinkDescription[][]): Promise<void> {
        this.linkDescriptions = result[0];
        await this.addNewLinks(result[1]);
        this.state.table.setRowObjectValueState(this.deleteLinkObjects, ValueState.HIGHLIGHT_REMOVED);
        this.setCanSubmit();
        this.setLinkDescriptions();
    }

    private async reviseLinkObjects(): Promise<void> {
        const linkedObjectIds: Map<KIXObjectType | string, string[]> = new Map();
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
    }

    private async prepareLinkedObjects(linkedObjectIds: Map<KIXObjectType | string, string[]>): Promise<void> {
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
                linkObject.linkedObjectDisplayId = await LabelService.getInstance().getObjectText(o, true, false);
                linkObject.title = await LabelService.getInstance().getObjectText(o, false, true);
            }
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
                const link = this.state.mainObject.Links.find((l) => l.ID === lo.ObjectId);
                if (link) {
                    const linkType = linkTypes.find(
                        (lt) => LinkUtil.isLinkType(lt, link, lo, this.state.mainObject)
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

        const table = await TableFactoryService.getInstance().createTable(
            'edit-linked-objects-dialog', KIXObjectType.LINK_OBJECT,
            null, null, EditLinkedObjectsDialogContext.CONTEXT_ID, null, null, null, null, true
        );

        this.tableSubscriber = {
            eventSubscriberId: 'edit-link-object-dialog',
            eventPublished: (data: TableEventData, eventId: string): void => {
                if (data && data.tableId === table.getTableId()) {
                    if (eventId === TableEvent.ROW_SELECTION_CHANGED) {
                        this.objectSelectionChanged(table.getSelectedRows().map((r) => r.getRowObject().getObject()));
                    }
                    if (eventId === TableEvent.TABLE_READY) {
                        this.state.table.setRowObjectValueState(this.newLinkObjects, ValueState.HIGHLIGHT_SUCCESS);
                        this.highlightDeletedRows();
                    }
                    if (eventId === TableEvent.TABLE_FILTERED) {
                        this.state.linkObjectCount = this.state.table.getRows().length;
                    }
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_FILTERED, this.tableSubscriber);

        this.state.table = table;
    }

    public objectSelectionChanged(newSelectedLinkObjects: LinkObject[]): void {
        this.selectedLinkObjects = newSelectedLinkObjects;
        this.state.canDelete = !!this.selectedLinkObjects.length;
    }

    private async addNewLinks(newLinkDescriptions: CreateLinkDescription[]): Promise<void> {
        if (newLinkDescriptions.length) {
            const newLinkObjects: LinkObject[] = [];

            for (const ld of newLinkDescriptions) {
                newLinkObjects.push(new LinkObject({
                    ObjectId: 'NEW-' + ld.linkableObject.KIXObjectType + '-' +
                        ld.linkableObject.ObjectId + '-' + ld.linkTypeDescription.linkType.TypeID,
                    linkedObjectKey: ld.linkableObject.ObjectId,
                    linkedObjectDisplayId: await LabelService.getInstance().getObjectText(
                        ld.linkableObject, true, false
                    ),
                    linkedObjectType: ld.linkableObject.KIXObjectType,
                    title: await LabelService.getInstance().getObjectText(ld.linkableObject, false, true),
                    linkedAs: ld.linkTypeDescription.asSource ?
                        ld.linkTypeDescription.linkType.SourceName : ld.linkTypeDescription.linkType.TargetName,
                    linkType: ld.linkTypeDescription.linkType,
                    isSource: ld.linkTypeDescription.asSource
                } as LinkObject));
            }

            this.availableLinkObjects = [...this.availableLinkObjects, ...newLinkObjects];
            this.newLinkObjects = [...this.newLinkObjects, ...newLinkObjects];

            const context = ContextService.getInstance().getActiveContext();
            context.setObjectList(KIXObjectType.LINK_OBJECT, [...this.availableLinkObjects]);
            context.getObjectList(KIXObjectType.LINK_OBJECT);

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

        if (deleteNewLinks.length) {
            const rowIds = this.state.table.getRows()
                .filter((r) => deleteNewLinks.some((dl) => dl.equals(r.getRowObject().getObject())))
                .map((r) => r.getRowId());
            this.state.table.removeRows(rowIds);
            this.linkDescriptions = this.linkDescriptions.filter(
                (ld) => !deleteNewLinks.some((dnl) => dnl.linkedObjectKey === ld.linkableObject.ObjectId)
            );
        }

        this.highlightDeletedRows();

        this.state.canDelete = false;
        this.setCanSubmit();
    }

    private highlightDeletedRows(): void {
        this.state.table.setRowsSelectableByObject(this.deleteLinkObjects, false);
        this.state.table.setRowObjectValueState(this.deleteLinkObjects, ValueState.HIGHLIGHT_REMOVED);
    }

    public cancel(): void {
        ContextService.getInstance().toggleActiveContext();
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

        let deleteLinksOK: boolean = true;
        if (linkIdsToDelete.length) {
            deleteLinksOK = await this.deleteLinks(linkIdsToDelete);
        }

        let createLinksOK: boolean = true;
        if (deleteLinksOK && !!this.newLinkObjects.length) {
            createLinksOK = await this.addLinks();
        }

        BrowserUtil.toggleLoadingShield('APP_SHIELD', false);
        if (createLinksOK && deleteLinksOK) {
            BrowserUtil.openSuccessOverlay('Translatable#Links updated.');
            ContextService.getInstance().toggleActiveContext(undefined, undefined, true);
        }
    }

    private async addLinks(): Promise<boolean> {
        const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(KIXObjectType.LINK_OBJECT);
        BrowserUtil.toggleLoadingShield('APP_SHIELD', true, 'Translatable#Create Links');
        let ok = true;
        for (const newLinkObject of this.newLinkObjects) {
            await service.createObject(
                KIXObjectType.LINK_OBJECT,
                newLinkObject,
                new CreateLinkObjectOptions(this.state.mainObject)
            ).catch(async (error) => {
                const msg = await TranslationService.translate(
                    'Translatable#Can not create link ({0})',
                    [(error as Error).Message ? error.Message : error.toString()]
                );
                BrowserUtil.openErrorOverlay(msg);
                ok = false;
                return;
            });
        }
        return ok;
    }

    private async deleteLinks(linkIdsToDelete: number[]): Promise<boolean> {
        BrowserUtil.toggleLoadingShield('APP_SHIELD', true, 'Translatable#Links will be removed.');
        const failIds = await KIXObjectService.deleteObject(KIXObjectType.LINK_OBJECT, linkIdsToDelete);
        return !failIds || failIds.length === 0;
    }

}

module.exports = Component;
