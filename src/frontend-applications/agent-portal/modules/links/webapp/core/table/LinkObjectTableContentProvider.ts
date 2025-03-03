/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { LinkObject } from '../../../model/LinkObject';
import { Table } from '../../../../table/model/Table';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { DataType } from '../../../../../model/DataType';
import { SortUtil } from '../../../../../model/SortUtil';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { LinkUtil } from '../LinkUtil';
import { RowObject } from '../../../../table/model/RowObject';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { KIXObjectSocketClient } from '../../../../base-components/webapp/core/KIXObjectSocketClient';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { Link } from '../../../model/Link';
import { EditLinkedObjectsDialogContext } from '../context';

export class LinkObjectTableContentProvider extends TableContentProvider<LinkObject> {

    public usePaging: boolean = true;

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string,
        objects?: KIXObject[]
    ) {
        super(KIXObjectType.LINK_OBJECT, table, objectIds, loadingOptions, contextId, objects);
        this.loadingOptions = new KIXObjectLoadingOptions();
        this.loadingOptions.limit = 20;
    }

    public async loadData(): Promise<RowObject<LinkObject>[]> {
        const context = ContextService.getInstance().getActiveContext();

        let contextObject: KIXObject;
        if (context instanceof EditLinkedObjectsDialogContext) {
            contextObject = await context.getObject('LinkObject');
        } else {
            contextObject = await context.getObject();
        }

        const pageSize = await this.getPageSize();
        this.currentLoadLimit = this.usePaging && pageSize
            ? this.currentPageIndex * pageSize
            : null;

        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.filter = [
            new FilterCriteria(
                'Object', SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, contextObject.KIXObjectType
            ),
            new FilterCriteria(
                'ObjectID', SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, contextObject.ObjectId
            )
        ];
        loadingOptions.limit = this.currentLoadLimit;
        const links = await KIXObjectService.loadObjects<Link>(
            KIXObjectType.LINK, null, loadingOptions, null, null, null, null, this.id
        );

        this.totalCount = KIXObjectSocketClient.getInstance().getCollectionsCount(this.id);

        this.loadingOptions = new KIXObjectLoadingOptions(
            null, null, 20, [KIXObjectProperty.LINKS], [KIXObjectProperty.LINKS]
        );

        let rowObjects: RowObject<LinkObject>[] = [];
        if (links?.length) {
            const linkedObjects = await this.prepareLinkObjects({
                KIXObjectType: contextObject.KIXObjectType,
                ObjectId: contextObject.ObjectId,
                Links: links
            });
            rowObjects = await this.getRowObjects(linkedObjects);
        }

        const newLinkObjects = await context.getObjectList<LinkObject>('newLinkObjects');
        if (newLinkObjects) {
            const newLinkRowObjects = await this.getRowObjects(newLinkObjects);
            rowObjects.push(...newLinkRowObjects);
        }

        return rowObjects;
    }

    private async prepareLinkObjects(object: any): Promise<LinkObject[]> {
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
