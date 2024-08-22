/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { Contact } from '../../model/Contact';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { ContactProperty } from '../../model/ContactProperty';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { NewContactDialogContext } from './context/NewContactDialogContext';
import { ObjectSearch } from '../../../object-search/model/ObjectSearch';
import { UserProperty } from '../../../user/model/UserProperty';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { BackendSearchDataType } from '../../../../model/BackendSearchDataType';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';

export class ContactService extends KIXObjectService<Contact> {

    private static INSTANCE: ContactService = null;

    public static getInstance(): ContactService {
        if (!ContactService.INSTANCE) {
            ContactService.INSTANCE = new ContactService();
        }

        return ContactService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.CONTACT);
        this.objectConstructors.set(KIXObjectType.CONTACT, [Contact]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONTACT;
    }

    public getLinkObjectName(): string {
        return 'Person';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType | string, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true, forceIds?: boolean, silent?: boolean, collectionId?: string
    ): Promise<O[]> {

        let objects: Contact[];

        const preload = await this.shouldPreload(KIXObjectType.CONTACT);

        if (loadingOptions?.includes?.some((i) => i === ContactProperty.TICKET_STATS)) {
            loadingOptions.cacheType = 'CONTACT_TICKET_STATS';
        }

        if (loadingOptions || !preload) {
            objects = await super.loadObjects<Contact>(
                KIXObjectType.CONTACT, objectIds, loadingOptions,
                undefined, undefined, undefined, undefined, collectionId
            );
        } else {
            objects = await super.loadObjects<Contact>(
                KIXObjectType.CONTACT, null, loadingOptions, objectLoadingOptions,
                undefined, undefined, undefined, collectionId
            );
            if (objectIds) {
                objects = objects.filter((c) => objectIds.map((id) => Number(id)).some((oid) => c.ObjectId === oid));
            }
        }

        return objects as any[];
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

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        switch (property) {
            case UserProperty.IS_AGENT:
            case UserProperty.IS_CUSTOMER:
                const yesText = await TranslationService.translate('Translatable#Yes');
                const noText = await TranslationService.translate('Translatable#No');
                nodes = [
                    new TreeNode(0, noText, 'kix-icon-close'),
                    new TreeNode(1, yesText, 'kix-icon-check')
                ];
                break;
            case ContactProperty.PRIMARY_ORGANISATION_ID:
            case ContactProperty.ORGANISATION_IDS:
                if (Array.isArray(filterIds)) {
                    const organisations = await KIXObjectService.loadObjects(
                        KIXObjectType.ORGANISATION, filterIds
                    );
                    nodes = await KIXObjectService.prepareTree(organisations);
                }
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

    public async prepareFullTextFilter(searchValue): Promise<FilterCriteria[]> {
        return [
            new FilterCriteria(
                SearchProperty.FULLTEXT, SearchOperator.LIKE, FilterDataType.STRING, FilterType.AND, `${searchValue}`
            )
        ];
    }

    public async updateObjectByForm(
        objectType: KIXObjectType | string, formId: string, objectId: number | string,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        if (objectId) {
            return super.updateObjectByForm(objectType, formId, objectId, cacheKeyPrefix);
        } else {
            return super.createObjectByForm(objectType, formId, null, cacheKeyPrefix);
        }
    }

    public async createObjectByForm(
        objectType: KIXObjectType | string, formId: string, createOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const contactId = await super.createObjectByForm(objectType, formId, createOptions, cacheKeyPrefix);

        const context = ContextService.getInstance().getActiveContext<NewContactDialogContext>();
        if (context) {
            context.contactId = Number(contactId);
        }

        return contactId;
    }

    public async getObjectProperties(objectType: KIXObjectType): Promise<string[]> {
        const superProperties = await super.getObjectProperties(objectType);
        const objectProperties: string[] = [
            ContactProperty.TITLE,
            ContactProperty.FIRSTNAME,
            ContactProperty.LASTNAME,
            ContactProperty.EMAIL,
            ContactProperty.EMAIL1,
            ContactProperty.EMAIL2,
            ContactProperty.EMAIL3,
            ContactProperty.EMAIL4,
            ContactProperty.EMAIL5,
            ContactProperty.COMMENT,
            ContactProperty.STREET,
            ContactProperty.ZIP,
            ContactProperty.CITY,
            ContactProperty.COUNTRY,
            ContactProperty.PHONE,
            ContactProperty.MOBILE,
            ContactProperty.FAX,
            ContactProperty.PRIMARY_ORGANISATION_ID,
            ContactProperty.ORGANISATION_IDS,

            KIXObjectProperty.CHANGE_TIME,
            KIXObjectProperty.CHANGE_BY,
            KIXObjectProperty.CREATE_TIME,
            KIXObjectProperty.CREATE_BY,
            KIXObjectProperty.VALID_ID,

            UserProperty.USER_LOGIN,
            UserProperty.IS_AGENT,
            UserProperty.IS_CUSTOMER
        ];
        return [...objectProperties, ...superProperties];
    }

    public async getObjectTypeForProperty(property: string): Promise<KIXObjectType | string> {
        let objectType = await super.getObjectTypeForProperty(property);

        if (objectType === this.objectType) {
            switch (property) {
                case ContactProperty.ASSIGNED_USER_ID:
                    objectType = KIXObjectType.USER;
                    break;
                case ContactProperty.PRIMARY_ORGANISATION_ID:
                case ContactProperty.ORGANISATION_IDS:
                    objectType = KIXObjectType.ORGANISATION;
                    break;
                default:
            }
        }
        return objectType;
    }

    public async getSortableAttributes(filtered: boolean = true
    ): Promise<ObjectSearch[]> {
        const supportedAttributes = await super.getSortableAttributes(filtered);

        const filterList = [
            'ContactID',
            ContactProperty.ORGANISATION_IDS,
            ContactProperty.ASSIGNED_USER_ID,
            'Organisation',
            'OrganisationID',
            'OrganisationNumber',
            ContactProperty.PRIMARY_ORGANISATION,
            ContactProperty.PRIMARY_ORGANISATION_NUMBER,
            'Login',
            'UserID'
        ];
        return filtered ?
            supportedAttributes.filter((sA) => !filterList.some((fp) => fp === sA.Property)) :
            supportedAttributes;
    }

    protected async getSortOrder(property: string, descending: boolean, orgProperty: string): Promise<string> {
        let sort = await super.getSortOrder(property, descending, orgProperty);

        // add second sort with counterpart to prevent mixed results on "is not ... and has no user"
        // result should be like "is agent, then all is not agent and then all without user" or vice versa
        if ((property === UserProperty.IS_AGENT || property === UserProperty.IS_CUSTOMER)) {
            const counterpart = this.getSortAttribute(
                property === UserProperty.IS_AGENT ? UserProperty.IS_CUSTOMER : UserProperty.IS_AGENT
            );
            if (counterpart) {
                const sortType = await this.getSortType(counterpart, this.objectType);
                sort = `${sort},${this.objectType}.${descending ? '-' : ''}${counterpart}:${sortType}`;
            }
        }
        return sort;
    }

    public getSortAttribute(attribute: string, dep?: string): string {
        switch (attribute) {
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                return ContactProperty.PRIMARY_ORGANISATION;
            case ContactProperty.ORGANISATION_IDS:
                return 'Organisation';
            default:
        }
        return super.getSortAttribute(attribute, dep);
    }

    protected async isBackendFilterSupportedForProperty(
        objectType: KIXObjectType | string, property: string, supportedAttributes: ObjectSearch[], dep?: string
    ): Promise<boolean> {
        const filterList = [
            ContactProperty.ASSIGNED_USER_ID,
            ContactProperty.ASSIGNED_CONFIG_ITEMS,
            ContactProperty.PRIMARY_ORGANISATION_NUMBER,
            ContactProperty.PRIMARY_ORGANISATION,
            ContactProperty.ORGANISATIONS,
            ContactProperty.USER,
            ContactProperty.TICKET_STATS,
            ContactProperty.REMINDER_TICKETS_COUNT,
            ContactProperty.OPEN_TICKETS_COUNT,
            ContactProperty.ESCALATED_TICKETS_COUNT,
            ContactProperty.CREATE_NEW_TICKET,
            ContactProperty.VALID
        ];
        if (filterList.some((f) => f === property)) {
            return false;
        }
        return super.isBackendFilterSupportedForProperty(objectType, property, supportedAttributes, dep);
    }

    protected async getBackendFilterType(property: string, dep?: string): Promise<BackendSearchDataType | string> {
        switch (property) {
            case ContactProperty.PRIMARY_ORGANISATION_ID:
            case ContactProperty.ORGANISATION_IDS:
                return 'Autocomplete';
            default:
        }
        return super.getBackendFilterType(property, dep);
    }
}
