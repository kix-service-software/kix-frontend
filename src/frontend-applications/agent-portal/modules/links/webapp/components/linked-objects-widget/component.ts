/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { Context } from '../../../../../model/Context';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { LinkObject } from '../../../model/LinkObject';
import { LinkUtil } from '../../core';
import { SortUtil } from '../../../../../model/SortUtil';
import { DataType } from '../../../../../model/DataType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        context.registerListener('kix-object-linked-objects-widget', {
            objectChanged: (id: string | number, object: KIXObject, type: KIXObjectType) => {
                this.prepareTable(context);
            },
            sidebarRightToggled: (): void => { return; },
            sidebarLeftToggled: (): void => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: (): void => { return; },
            scrollInformationChanged: () => { return; },
            additionalInformationChanged: (): void => { return; }
        });

        this.prepareTable(context);
    }

    private async prepareTable(context: Context): Promise<void> {
        this.state.prepared = false;

        const contextObject = await context.getObject();

        const loadedObjects = await KIXObjectService.loadObjects(
            contextObject.KIXObjectType, [contextObject.ObjectId],
            new KIXObjectLoadingOptions(null, null, null, [KIXObjectProperty.LINKS], [KIXObjectProperty.LINKS])
        );

        let linkObjects = [];
        if (Array.isArray(loadedObjects) && loadedObjects.length && Array.isArray(loadedObjects[0].Links)) {
            linkObjects = await this.prepareLinkObjects(loadedObjects[0]);
        }

        const tableConfiguration = new TableConfiguration(
            null, null, null, KIXObjectType.LINK_OBJECT, null, 25, null, [], false, false,
            null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = await TableFactoryService.getInstance().createTable(
            'linked-objects-widget', KIXObjectType.LINK_OBJECT, tableConfiguration,
            null, null, null, null, null, null, true, linkObjects
        );

        this.state.table = table;

        setTimeout(() => this.state.prepared = true, 10);
    }

    private async prepareLinkObjects(object: KIXObject): Promise<LinkObject[]> {
        const links = await LinkUtil.getLinkObjects(object);
        links.sort((a, b) => {
            return SortUtil.compareValues(a.linkedObjectType, b.linkedObjectType, DataType.STRING);
        });
        const linkedObjectIds: Map<KIXObjectType | string, string[]> = new Map();
        links.forEach((lo) => {
            if (linkedObjectIds.has(lo.linkedObjectType)) {
                if (linkedObjectIds.get(lo.linkedObjectType).findIndex((id) => id === lo.linkedObjectKey) === -1) {
                    linkedObjectIds.get(lo.linkedObjectType).push(lo.linkedObjectKey);
                }
            } else {
                linkedObjectIds.set(lo.linkedObjectType, [lo.linkedObjectKey]);
            }
        });
        return await this.prepareLinkedObjects(linkedObjectIds, links);
    }

    private async prepareLinkedObjects(
        linkedObjectIds: Map<KIXObjectType | string, string[]>, links: LinkObject[]
    ): Promise<LinkObject[]> {
        let linkedObjects = [];
        const iterator = linkedObjectIds.entries();
        let objectIds = iterator.next();
        while (objectIds && objectIds.value) {
            if (objectIds.value[1].length) {
                const objects = await KIXObjectService.loadObjects(
                    objectIds.value[0], objectIds.value[1], null
                );
                linkedObjects = [...linkedObjects, ...objects];
            }

            objectIds = iterator.next();
        }

        for (const o of linkedObjects) {
            const linkObject = links.find(
                (lo) => lo.linkedObjectType === o.KIXObjectType && lo.linkedObjectKey === o.ObjectId.toString()
            );
            if (linkObject) {
                linkObject.linkedObjectDisplayId = await LabelService.getInstance().getObjectText(o, true, false);
                linkObject.title = await LabelService.getInstance().getObjectText(o, false, true);
            }
        }

        return links;
    }
}

module.exports = Component;
