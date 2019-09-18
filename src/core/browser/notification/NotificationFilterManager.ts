/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    AbstractDynamicFormManager, LabelService, ObjectPropertyValue, DynamicFormOperationsType, KIXObjectService
} from "..";
import {
    KIXObjectType, TicketProperty, ArticleProperty, InputFieldTypes, TreeNode
} from "../../model";
import { TicketService } from "../ticket";

export class NotificationFilterManager extends AbstractDynamicFormManager {

    public objectType: KIXObjectType = KIXObjectType.NOTIFICATION;

    public async getOpertationsType(property: string): Promise<DynamicFormOperationsType> {
        return DynamicFormOperationsType.NONE;
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties = [];

        const ticketProperties = [
            TicketProperty.TYPE_ID, TicketProperty.STATE_ID, TicketProperty.PRIORITY_ID,
            TicketProperty.QUEUE_ID, TicketProperty.LOCK_ID, TicketProperty.ORGANISATION_ID,
            TicketProperty.CONTACT_ID, TicketProperty.OWNER_ID, TicketProperty.RESPONSIBLE_ID
        ];

        const articleProperties = [
            "ArticleSubjectMatch", "ArticleBodyMatch"
        ];

        for (const ticketProperty of ticketProperties) {
            const label = await LabelService.getInstance().getPropertyText(ticketProperty, KIXObjectType.TICKET);
            properties.push([ticketProperty, label]);
        }

        for (const articleProperty of articleProperties) {
            const label = await LabelService.getInstance().getPropertyText(articleProperty, KIXObjectType.ARTICLE);
            properties.push([articleProperty, label]);
        }

        return properties;
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        switch (property) {
            case TicketProperty.TYPE_ID:
            case TicketProperty.STATE_ID:
            case TicketProperty.PRIORITY_ID:
            case TicketProperty.QUEUE_ID:
            case TicketProperty.LOCK_ID:
            case TicketProperty.SERVICE:
            case TicketProperty.SLA:
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
                return InputFieldTypes.DROPDOWN;
            case TicketProperty.ORGANISATION_ID:
            case TicketProperty.CONTACT_ID:
                return InputFieldTypes.OBJECT_REFERENCE;
            default:
                return InputFieldTypes.TEXT;
        }
    }

    public async getObjectReferenceObjectType(property: string): Promise<KIXObjectType> {
        switch (property) {
            case TicketProperty.ORGANISATION_ID:
                return KIXObjectType.ORGANISATION;
            case TicketProperty.CONTACT_ID:
                return KIXObjectType.CONTACT;
            default:
        }
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        switch (property) {
            case TicketProperty.TYPE_ID:
            case TicketProperty.STATE_ID:
            case TicketProperty.PRIORITY_ID:
            case TicketProperty.QUEUE_ID:
            case TicketProperty.SERVICE:
            case TicketProperty.SLA:
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
            case TicketProperty.LOCK_ID:
                return TicketService.getInstance().getTreeNodes(property, false);
            default:
                return [];
        }
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return typeof value.property !== 'undefined' && value.property !== null;
    }

    public isMultiselect(property: string): boolean {
        switch (property) {
            case TicketProperty.TYPE_ID:
            case TicketProperty.STATE_ID:
            case TicketProperty.PRIORITY_ID:
            case TicketProperty.QUEUE_ID:
            case TicketProperty.SERVICE:
            case TicketProperty.SLA:
            case TicketProperty.ORGANISATION_ID:
            case TicketProperty.CONTACT_ID:
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
                return true;
            default:
                return false;
        }
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        let tree = [];

        switch (property) {
            case TicketProperty.CONTACT_ID:
                const contacts = await KIXObjectService.search(KIXObjectType.CONTACT, searchValue, limit);
                tree = await KIXObjectService.prepareTree(contacts);
                break;
            case TicketProperty.ORGANISATION_ID:
                const organisations = await KIXObjectService.search(KIXObjectType.ORGANISATION, searchValue, limit);
                tree = await KIXObjectService.prepareTree(organisations);
                break;
            default:
        }

        return tree;
    }

}
