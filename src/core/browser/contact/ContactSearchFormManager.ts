/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractDynamicFormManager } from "../form";
import { KIXObjectType, ContactProperty, KIXObjectProperty, CRUD, InputFieldTypes, TreeNode } from "../../model";
import { SearchProperty } from "../SearchProperty";
import { LabelService } from "../LabelService";
import { UIComponentPermission } from "../../model/UIComponentPermission";
import { AuthenticationSocketClient } from "../application/AuthenticationSocketClient";
import { SearchOperator } from "../SearchOperator";
import { SearchDefinition, KIXObjectService } from "../kix";
import { SearchOperatorUtil } from "../SearchOperatorUtil";
import { ContactService } from "./ContactService";

export class ContactSearchFormManager extends AbstractDynamicFormManager {

    public objectType: KIXObjectType = KIXObjectType.CONTACT;

    protected readPermissions: Map<string, boolean> = new Map();

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [
            [SearchProperty.FULLTEXT, null],
            [ContactProperty.FIRSTNAME, null],
            [ContactProperty.LASTNAME, null],
            [ContactProperty.EMAIL, null],
            [ContactProperty.LOGIN, null],
            [ContactProperty.COUNTRY, null],
            [ContactProperty.STREET, null],
            [ContactProperty.ZIP, null],
            [ContactProperty.CITY, null],
            [ContactProperty.FAX, null],
            [ContactProperty.PHONE, null],
            [ContactProperty.MOBILE, null]
        ];

        if (await this.checkReadPermissions('organisations')) {
            properties.push([ContactProperty.PRIMARY_ORGANISATION_ID, 'Translatable#Assigned Organisation']);
        }

        if (await this.checkReadPermissions('system/valid')) {
            properties.push([KIXObjectProperty.VALID_ID, null]);
        }

        for (const p of properties) {
            const label = await LabelService.getInstance().getPropertyText(
                p[0], KIXObjectType.CONTACT
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

        if (this.isDropDown(property)) {
            operations = [SearchOperator.IN];
        } else {
            operations = SearchDefinition.getStringOperators();
        }

        return operations;
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        if (property === ContactProperty.PRIMARY_ORGANISATION_ID) {
            return InputFieldTypes.OBJECT_REFERENCE;
        } else if (this.isDropDown(property)) {
            return InputFieldTypes.DROPDOWN;
        }

        return InputFieldTypes.TEXT;
    }

    private isDropDown(property: string): boolean {
        return property === KIXObjectProperty.VALID_ID
            || property === ContactProperty.PRIMARY_ORGANISATION_ID;
    }

    public async getOperatorDisplayText(operator: string): Promise<string> {
        return await SearchOperatorUtil.getText(operator as SearchOperator);
    }

    public isMultiselect(property: string): boolean {
        return true;
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        const nodes = await ContactService.getInstance().getTreeNodes(property, true);
        return nodes;
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        let tree = [];
        if (property === ContactProperty.PRIMARY_ORGANISATION_ID) {
            const organisations = await KIXObjectService.search(KIXObjectType.ORGANISATION, searchValue, limit);
            tree = await KIXObjectService.prepareTree(organisations);
        }
        return tree;
    }

}
