import {
    Organisation, KIXObjectType, OrganisationProperty, TreeNode, KIXObject,
    KIXObjectProperty, FilterCriteria, FilterDataType, FilterType, ValidObject
} from "../../model";
import { ContextService } from "../context";
import { KIXObjectService } from "../kix";
import { OrganisationDetailsContext } from "./context";
import { SearchOperator } from "../SearchOperator";

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

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        let values: TreeNode[] = [];

        switch (property) {
            case KIXObjectProperty.VALID_ID:
                const validObjects = await KIXObjectService.loadObjects<ValidObject>(KIXObjectType.VALID_OBJECT);
                values = validObjects.map((vo) => new TreeNode(Number(vo.ID), vo.Name));
                break;
            default:
        }

        return values;
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
