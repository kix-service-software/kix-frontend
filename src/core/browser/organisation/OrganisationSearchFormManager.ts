/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractDynamicFormManager } from "../form";
import { KIXObjectType, OrganisationProperty, KIXObjectProperty, CRUD, InputFieldTypes, TreeNode } from "../../model";
import { SearchProperty } from "../SearchProperty";
import { LabelService } from "../LabelService";
import { AuthenticationSocketClient } from "../application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../model/UIComponentPermission";
import { SearchOperatorUtil } from "../SearchOperatorUtil";
import { SearchOperator } from "../SearchOperator";
import { SearchDefinition } from "../kix";
import { OrganisationService } from "./OrganisationService";

export class OrganisationSearchFormManager extends AbstractDynamicFormManager {

    public objectType: KIXObjectType = KIXObjectType.ORGANISATION;

    protected readPermissions: Map<string, boolean> = new Map();

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [
            [SearchProperty.FULLTEXT, null],
            [OrganisationProperty.NAME, null],
            [OrganisationProperty.NUMBER, null],
            [OrganisationProperty.CITY, null],
            [OrganisationProperty.COUNTRY, null],
            [OrganisationProperty.STREET, null],
            [OrganisationProperty.URL, null],
            [OrganisationProperty.ZIP, null]
        ];

        if (await this.checkReadPermissions('system/valid')) {
            properties.push([KIXObjectProperty.VALID_ID, null]);
        }

        for (const p of properties) {
            const label = await LabelService.getInstance().getPropertyText(
                p[0], KIXObjectType.ORGANISATION
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

        if (property === SearchProperty.FULLTEXT) {
            operations = [SearchOperator.CONTAINS];
        } else if (this.isDropDown(property)) {
            operations = [SearchOperator.IN];
        } else {
            operations = SearchDefinition.getStringOperators();
        }

        return operations;
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        if (this.isDropDown(property)) {
            return InputFieldTypes.DROPDOWN;
        }

        return InputFieldTypes.TEXT;
    }

    private isDropDown(property: string): boolean {
        return property === KIXObjectProperty.VALID_ID;
    }

    public async getOperatorDisplayText(operator: string): Promise<string> {
        return await SearchOperatorUtil.getText(operator as SearchOperator);
    }

    public isMultiselect(property: string): boolean {
        return true;
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        const nodes = await OrganisationService.getInstance().getTreeNodes(property, true);
        return nodes;
    }

}
