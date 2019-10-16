/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractDynamicFormManager } from "../form";
import { KIXObjectType, TicketProperty, KIXObjectProperty, CRUD, InputFieldTypes, TreeNode } from "../../model";
import { SearchProperty } from "../SearchProperty";
import { AuthenticationSocketClient } from "../application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../model/UIComponentPermission";
import { SearchOperator } from "../SearchOperator";
import { SearchDefinition, KIXObjectService } from "../kix";
import { LabelService } from "../LabelService";
import { SearchOperatorUtil } from "../SearchOperatorUtil";
import { TicketService } from "./TicketService";

export class TicketSearchFormManager extends AbstractDynamicFormManager {

    public objectType: KIXObjectType = KIXObjectType.TICKET;

    protected readPermissions: Map<string, boolean> = new Map();

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [
            [SearchProperty.FULLTEXT, null],
            [TicketProperty.TICKET_NUMBER, null],
            [TicketProperty.TITLE, null],
            [TicketProperty.CREATED, null],
            [TicketProperty.CLOSE_TIME, null],
            [TicketProperty.CHANGED, null],
            [TicketProperty.PENDING_TIME, null],
            [TicketProperty.LAST_CHANGE_TIME, null]
        ];

        if (await this.checkReadPermissions('organisations')) {
            properties.push([TicketProperty.ORGANISATION_ID, null]);
        }

        if (await this.checkReadPermissions('contacts')) {
            properties.push([TicketProperty.CONTACT_ID, null]);
        }

        if (await this.checkReadPermissions('system/ticket/types')) {
            properties.push([TicketProperty.TYPE_ID, null]);
        }

        if (await this.checkReadPermissions('system/ticket/states')) {
            properties.push([TicketProperty.STATE_ID, null]);
        }

        if (await this.checkReadPermissions('system/ticket/queues')) {
            properties.push([TicketProperty.QUEUE_ID, null]);
        }

        if (await this.checkReadPermissions('system/ticket/priorities')) {
            properties.push([TicketProperty.PRIORITY_ID, null]);
        }

        if (await this.checkReadPermissions('system/ticket/locks')) {
            properties.push([TicketProperty.LOCK_ID, null]);
        }

        if (await this.checkReadPermissions('system/users')) {
            properties.push([TicketProperty.OWNER_ID, null]);
            properties.push([TicketProperty.RESPONSIBLE_ID, null]);
            properties.push([KIXObjectProperty.CREATE_BY, null]);
            properties.push([KIXObjectProperty.CHANGE_BY, null]);
        }

        for (const p of properties) {
            const label = await LabelService.getInstance().getPropertyText(
                p[0], KIXObjectType.TICKET
            );
            p[1] = label;
        }

        return properties;
    }

    protected async checkReadPermissions(resource: string): Promise<boolean> {
        if (!this.readPermissions.has(resource)) {
            const permission = await AuthenticationSocketClient.getInstance().checkPermissions(
                [new UIComponentPermission(resource, [CRUD.READ])]
            );
            this.readPermissions.set(resource, permission);
        }

        return this.readPermissions.get(resource);
    }

    public async getOperations(property: string): Promise<any[]> {
        let operations: SearchOperator[] = [];

        switch (property) {
            case TicketProperty.TICKET_NUMBER:
            case TicketProperty.TITLE:
                operations = SearchDefinition.getStringOperators();
                break;
            case TicketProperty.TYPE_ID:
            case TicketProperty.STATE_ID:
            case TicketProperty.QUEUE_ID:
            case TicketProperty.PRIORITY_ID:
            case TicketProperty.ORGANISATION_ID:
            case TicketProperty.CONTACT_ID:
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
            case KIXObjectProperty.CREATE_BY:
            case KIXObjectProperty.CHANGE_BY:
                operations = [SearchOperator.IN];
                break;
            case TicketProperty.LOCK_ID:
                operations = [SearchOperator.EQUALS];
                break;
            case TicketProperty.AGE:
            case TicketProperty.CREATED:
            case TicketProperty.CLOSE_TIME:
            case TicketProperty.CHANGED:
            case TicketProperty.PENDING_TIME:
            case TicketProperty.LAST_CHANGE_TIME:
            case TicketProperty.ESCALATION_TIME:
            case TicketProperty.ESCALATION_RESPONSE_TIME:
            case TicketProperty.ESCALATION_UPDATE_TIME:
            case TicketProperty.ESCALATION_SOLUTION_TIME:
                operations = SearchDefinition.getDateTimeOperators();
                break;
            case SearchProperty.FULLTEXT:
                operations = [SearchOperator.CONTAINS];
                break;
            default:
                operations = [];
        }

        return operations;
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        if (this.isDropDown(property)) {
            return InputFieldTypes.DROPDOWN;
        } else if (this.isDateTime(property)) {
            return InputFieldTypes.DATE_TIME;
        } else if (property === TicketProperty.ORGANISATION_ID || property === TicketProperty.CONTACT_ID) {
            return InputFieldTypes.OBJECT_REFERENCE;
        }

        return InputFieldTypes.TEXT;
    }

    private isDropDown(property: string): boolean {
        return property === TicketProperty.QUEUE_ID
            || property === TicketProperty.STATE_ID
            || property === TicketProperty.PRIORITY_ID
            || property === TicketProperty.TYPE_ID
            || property === TicketProperty.LOCK_ID
            || property === TicketProperty.OWNER_ID
            || property === TicketProperty.RESPONSIBLE_ID
            || property === KIXObjectProperty.CREATE_BY
            || property === KIXObjectProperty.CHANGE_BY;
    }

    private isDateTime(property: string): boolean {
        return property === TicketProperty.AGE
            || property === TicketProperty.CREATED
            || property === TicketProperty.CLOSE_TIME
            || property === TicketProperty.CHANGED
            || property === TicketProperty.PENDING_TIME
            || property === TicketProperty.LAST_CHANGE_TIME
            || property === TicketProperty.ESCALATION_TIME
            || property === TicketProperty.ESCALATION_RESPONSE_TIME
            || property === TicketProperty.ESCALATION_SOLUTION_TIME
            || property === TicketProperty.ESCALATION_UPDATE_TIME;
    }

    public async getOperatorDisplayText(operator: string): Promise<string> {
        return await SearchOperatorUtil.getText(operator as SearchOperator);
    }

    public isMultiselect(property: string): boolean {
        return true;
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        const nodes = await TicketService.getInstance().getTreeNodes(property, true);
        return nodes;
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
