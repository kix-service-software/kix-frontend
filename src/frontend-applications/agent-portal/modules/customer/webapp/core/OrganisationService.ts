/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { ValidIDProperty } from '../../../base-components/webapp/core/ValidIDProperty';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { LabelService } from '../../../base-components/webapp/core/LabelService';

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
            case OrganisationProperty.PARENT_ID:
                const loadingOptions = new KIXObjectLoadingOptions([
                    new FilterCriteria(
                        OrganisationProperty.PARENT_ID, SearchOperator.EMPTY, FilterDataType.STRING,
                        FilterType.AND, 1
                    )
                ], null, null, [OrganisationProperty.SUB_ORGANISATIONS], [OrganisationProperty.SUB_ORGANISATIONS]);
                const organisations = await KIXObjectService.loadObjects<Organisation>(
                    KIXObjectType.ORGANISATION, null, loadingOptions
                );

                nodes = await this.prepareObjectTree(
                    organisations, showInvalid, invalidClickable,
                    filterIds ? filterIds.map((fid) => Number(fid)) : null
                );
                break;
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
                SearchProperty.FULLTEXT, SearchOperator.LIKE, FilterDataType.STRING, FilterType.AND, `${searchValue}`
            )
        ];
    }

    public async getObjectProperties(objectType: KIXObjectType): Promise<string[]> {
        const superProperties = await super.getObjectProperties(objectType);
        const objectProperties: string[] = [
            OrganisationProperty.NUMBER,
            OrganisationProperty.NAME,
            OrganisationProperty.URL,
            OrganisationProperty.COMMENT,
            OrganisationProperty.STREET,
            OrganisationProperty.ZIP,
            OrganisationProperty.CITY,
            OrganisationProperty.COUNTRY,

            KIXObjectProperty.CHANGE_TIME,
            KIXObjectProperty.CHANGE_BY,
            KIXObjectProperty.CREATE_TIME,
            KIXObjectProperty.CREATE_BY,
            KIXObjectProperty.VALID_ID
        ];
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

    public async prepareObjectTree(
        objects: KIXObject[], showInvalid: boolean = false, invalidClickable: boolean = false,
        filterIds?: number[], translatable?: boolean
    ): Promise<TreeNode[]> {
        let nodes = [];
        if (objects?.length) {
            if (objects[0].KIXObjectType === KIXObjectType.ORGANISATION) {
                objects = await this.prepareOrganisationTree(objects as Organisation[], filterIds);

                if (!showInvalid) {
                    objects = objects.filter(
                        (o: Organisation) => o.ValidID === 1 || this.hasValidDescendants(o.SubOrganisations));
                } else if (!invalidClickable) {
                    objects = (objects as Organisation[]).filter(
                        (o) => o.ValidID === 1 || this.hasValidDescendants(o.SubOrganisations)
                    );
                }

                for (const org of (objects as Organisation[])) {
                    const subTree = await this.prepareObjectTree(
                        org.SubOrganisations, showInvalid, invalidClickable, filterIds
                    );

                    const label = await LabelService.getInstance().getObjectText(org);

                    const treeNode = new TreeNode(
                        org.ID, label,
                        new ObjectIcon(null, KIXObjectType.ORGANISATION, org.ID),
                        null,
                        subTree,
                        null, null, null, null, null, null, null,
                        invalidClickable ? true : org.ValidID === 1,
                        undefined, undefined, undefined, undefined,
                        org.ValidID !== 1
                    );
                    nodes.push(treeNode);
                }
            } else {
                nodes = await super.prepareObjectTree(objects, showInvalid, invalidClickable, filterIds, translatable);
            }
        }

        return nodes;
    }

    public async prepareOrganisationTree(organisations: Organisation[], assignedOrgIDs: number[] = null,
        isSub?: boolean, identifiedSubOrgs?: Organisation[]): Promise<Organisation[]> {
        const result: Organisation[] = [];

        let autoAssignActive = false;
        const sysConfigValue = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.ORGANISATION_VIRTUALLY_ASSIGN_CONTACTS_TO_SUB_ORGANISATIONS]
        ).catch(() => [] as SysConfigOption[]);
        if (sysConfigValue && sysConfigValue.length && Number(sysConfigValue[0].Value) > 0) {
            autoAssignActive = true;
        }

        if (!isSub)
            identifiedSubOrgs = [];

        for (const org of organisations) {
            if (isSub) {
                if (Array.isArray(assignedOrgIDs) && assignedOrgIDs.indexOf(org.ID) < 0)
                    org.ValidID = ValidIDProperty.INVALID;
                identifiedSubOrgs.push(org);
            }

            if (org.SubOrganisations.length) {
                const validSubOrgs = await this.prepareOrganisationTree(org.SubOrganisations,
                    assignedOrgIDs, true, identifiedSubOrgs);
                if (!validSubOrgs)
                    org.SubOrganisations = [];
            }
        }


        if (!isSub) {
            // filter out all top-level orgs that are sub-orgs of others
            for (const org of organisations) {
                const found = identifiedSubOrgs ? identifiedSubOrgs.find((o) => o.ID === org.ID) : false;
                if (!found)
                    result.push(org);
            }
        }
        else if (!autoAssignActive) {
            // filter out all non-valid orgs in sub-trees
            for (const org of organisations) {
                if (org.ValidID === ValidIDProperty.VALID)
                    result.push(org);
            }
        }

        return result;
    }

    private hasValidDescendants(organisations: Organisation[]): boolean {
        let hasValidDescendants: boolean = false;
        if (organisations && !!organisations.length) {
            for (const org of organisations) {
                if (org.ValidID === 1) {
                    hasValidDescendants = true;
                } else {
                    hasValidDescendants = this.hasValidDescendants(org.SubOrganisations);
                }
                if (hasValidDescendants) {
                    break;
                }
            }
        }
        return hasValidDescendants;
    }

}
