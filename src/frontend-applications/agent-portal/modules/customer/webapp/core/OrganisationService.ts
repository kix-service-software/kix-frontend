/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { Organisation } from '../../model/Organisation';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { OrganisationProperty } from '../../model/OrganisationProperty';
import { ObjectSearch } from '../../../object-search/model/ObjectSearch';

export class OrganisationService extends KIXObjectService<Organisation> {

    private static INSTANCE: OrganisationService = null;

    public static getInstance(): OrganisationService {
        if (!OrganisationService.INSTANCE) {
            OrganisationService.INSTANCE = new OrganisationService();
        }

        return OrganisationService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.ORGANISATION);
        this.objectConstructors.set(KIXObjectType.ORGANISATION, [Organisation]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.ORGANISATION;
    }

    public getLinkObjectName(): string {
        return 'Person';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType | string, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true, forceIds?: boolean, silent?: boolean, collectionId?: string
    ): Promise<O[]> {
        let objects: Organisation[];

        const preload = await this.shouldPreload(KIXObjectType.ORGANISATION);

        if (loadingOptions?.includes?.some((i) => i === OrganisationProperty.TICKET_STATS)) {
            loadingOptions.cacheType = 'ORGANISATION_TICKET_STATS';
        }

        if (loadingOptions || !preload) {
            objects = await super.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, objectIds, loadingOptions,
                undefined, undefined, undefined, silent, collectionId
            );
        } else {
            objects = await super.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, null, loadingOptions, objectLoadingOptions,
                undefined, undefined, silent, collectionId
            );
            if (objectIds) {
                objects = objects.filter((c) => objectIds.map((id) => Number(id)).some((oid) => c.ObjectId === oid));
            }
        }

        return objects as any[];
    }

    public determineDependendObjects(
        organisations: Organisation[], targetObjectType: KIXObjectType
    ): string[] | number[] {
        const ids = [];

        if (targetObjectType === KIXObjectType.CONTACT) {
            organisations.forEach((c) => {
                if (c.Contacts) {
                    c.Contacts.forEach((co) => {
                        if (typeof co === 'string') {
                            if (!ids.some((id) => id === co)) {
                                ids.push(co);
                            }
                        } else {
                            if (!ids.some((id) => id === co.ID)) {
                                ids.push(co.ID);
                            }
                        }
                    });
                }
            });
        } else if (targetObjectType === KIXObjectType.TICKET) {
            organisations.forEach((c) => {
                if (c.Tickets) {
                    c.Tickets.forEach((t) => {
                        if (typeof t === 'number' || typeof t === 'string') {
                            if (!ids.some((id) => id === t)) {
                                ids.push(t);
                            }
                        } else {
                            if (!ids.some((id) => id === t.TicketID)) {
                                ids.push(t.TicketID);
                            }
                        }
                    });
                }
            });
        }

        return ids;
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        switch (property) {
            default:
                nodes = await super.getTreeNodes(property, showInvalid, invalidClickable, filterIds);
        }

        return nodes;
    }

    public async getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string> {
        const id = object ? object.ObjectId : objectId;
        const context = ContextService.getInstance().getActiveContext();
        return context.descriptor.urlPaths[0] + '/' + id;
    }

    public async prepareFullTextFilter(searchValue: string): Promise<FilterCriteria[]> {
        return [
            new FilterCriteria(
                SearchProperty.FULLTEXT, SearchOperator.LIKE, FilterDataType.STRING, FilterType.OR, `*${searchValue}*`
            )
        ];
    }

    public async getObjectProperties(objectType: KIXObjectType): Promise<string[]> {
        const superProperties = await super.getObjectProperties(objectType);
        const objectProperties: string[] = [];
        for (const property in OrganisationProperty) {
            if (OrganisationProperty[property]) {
                objectProperties.push(OrganisationProperty[property]);
            }
        }
        return [...objectProperties, ...superProperties];
    }

    public async getSortableAttributes(filtered: boolean = true): Promise<ObjectSearch[]> {
        const supportedAttributes = await super.getSortableAttributes(filtered);

        const filterList = [
            'OrganisationID'
        ];
        return filtered ?
            supportedAttributes.filter((sA) => !filterList.some((fp) => fp === sA.Property)) :
            supportedAttributes;
    }

}
