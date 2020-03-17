/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../../../../modules/base-components/webapp/core/KIXObjectService";
import { Organisation } from "../../model/Organisation";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TreeNode } from "../../../base-components/webapp/core/tree";
import { KIXObject } from "../../../../model/kix/KIXObject";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { OrganisationDetailsContext } from ".";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { OrganisationProperty } from "../../model/OrganisationProperty";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";

export class OrganisationService extends KIXObjectService<Organisation> {

    private static INSTANCE: OrganisationService = null;

    public static getInstance(): OrganisationService {
        if (!OrganisationService.INSTANCE) {
            OrganisationService.INSTANCE = new OrganisationService();
        }

        return OrganisationService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.ORGANISATION;
    }

    public getLinkObjectName(): string {
        return "Person";
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
        const context = await ContextService.getInstance().getContext(OrganisationDetailsContext.CONTEXT_ID);
        return context.getDescriptor().urlPaths[0] + '/' + id;
    }

    public async prepareFullTextFilter(searchValue): Promise<FilterCriteria[]> {
        return [
            new FilterCriteria(
                OrganisationProperty.NUMBER, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                OrganisationProperty.NAME, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                OrganisationProperty.URL, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                OrganisationProperty.STREET, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                OrganisationProperty.COUNTRY, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                OrganisationProperty.ZIP, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            )
        ];
    }

}
