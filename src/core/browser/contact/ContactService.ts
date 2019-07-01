import {
    ContactProperty, KIXObjectType, Contact, OrganisationProperty, TreeNode, KIXObject,
    KIXObjectProperty, FilterCriteria, FilterDataType, FilterType, ValidObject
} from "../../model";
import { ContactDetailsContext } from ".";
import { ContextService } from "../context";
import { KIXObjectService } from "../kix";
import { SearchOperator } from "../SearchOperator";

export class ContactService extends KIXObjectService<Contact> {

    private static INSTANCE: ContactService = null;

    public static getInstance(): ContactService {
        if (!ContactService.INSTANCE) {
            ContactService.INSTANCE = new ContactService();
        }

        return ContactService.INSTANCE;
    }

    private constructor() {
        super();

    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.CONTACT;
    }

    public getLinkObjectName(): string {
        return "Person";
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        if (value) {
            if (property === ContactProperty.PRIMARY_ORGANISATION_ID) {
                if (typeof value === 'object') {
                    value = value[OrganisationProperty.ID];
                }
                parameter.push([ContactProperty.ORGANISATION_IDS, [value]]);
            }
            parameter.push([property, value]);
        }

        return parameter;
    }

    public determineDependendObjects(contacts: Contact[], targetObjectType: KIXObjectType): string[] | number[] {
        let ids = [];

        if (targetObjectType === KIXObjectType.ORGANISATION) {
            contacts.forEach((contact) => {
                contact.OrganisationIDs.forEach((organisationId) => {
                    if (!ids.some((id) => id === organisationId)) {
                        ids.push(organisationId);
                    }
                });
            });
        } else if (targetObjectType === KIXObjectType.TICKET) {
            contacts.forEach((contact) => {
                const ticketIds = contact.Tickets.map(
                    (t) => (typeof t === 'number' || typeof t === 'string') ? t : t.TicketID
                );

                if (ticketIds.length) {
                    ids = [...ids, ...ticketIds];
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
        const context = await ContextService.getInstance().getContext(ContactDetailsContext.CONTEXT_ID);
        return context.getDescriptor().urlPaths[0] + '/' + id;
    }

    public async prepareFullTextFilter(searchValue): Promise<FilterCriteria[]> {
        return [
            new FilterCriteria(
                ContactProperty.LOGIN, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                ContactProperty.EMAIL, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                ContactProperty.FIRSTNAME, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                ContactProperty.LASTNAME, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                ContactProperty.TITLE, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                ContactProperty.PHONE, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                ContactProperty.FAX, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                ContactProperty.MOBILE, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                ContactProperty.STREET, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                ContactProperty.CITY, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            ),
            new FilterCriteria(
                ContactProperty.COUNTRY, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            )
        ];
    }
}
