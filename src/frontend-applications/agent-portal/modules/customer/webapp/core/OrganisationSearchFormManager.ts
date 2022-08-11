/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { OrganisationService } from './OrganisationService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { OrganisationProperty } from '../../model/OrganisationProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { AuthenticationSocketClient } from '../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { SearchOperatorUtil } from '../../../search/webapp/core';
import { InputFieldTypes } from '../../../../modules/base-components/webapp/core/InputFieldTypes';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { SearchFormManager } from '../../../base-components/webapp/core/SearchFormManager';
import { Organisation } from '../../model/Organisation';

export class OrganisationSearchFormManager extends SearchFormManager {

    public objectType: KIXObjectType = KIXObjectType.ORGANISATION;

    protected readPermissions: Map<string, boolean> = new Map();

    public constructor(
        public ignorePropertiesFixed: string[] = [],
        private validDynamicFields: boolean = true
    ) {
        super();
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        let properties: Array<[string, string]> = [
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

        const superProperties = await super.getProperties(this.validDynamicFields);
        properties = [...properties, ...superProperties];

        properties = properties.filter(
            (p) => !this.ignorePropertiesFixed.some((ip) => ip === p[0])
                && !this.ignoreProperties.some((ip) => ip === p[0])
        );

        return properties.sort((a, b) => a[1].localeCompare(b[1]));
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

    public async getOperations(property: string): Promise<Array<string | SearchOperator>> {
        let operations: Array<string | SearchOperator> = [];

        const searchProperty = Organisation.SEARCH_PROPERTIES.find((p) => p.Property === property);
        if (searchProperty) {
            operations = searchProperty.Operations;
        } else {
            switch (property) {
                case KIXObjectProperty.VALID_ID:
                    operations = [SearchOperator.IN];
                    break;
                case SearchProperty.FULLTEXT:
                    operations = [SearchOperator.CONTAINS];
                    break;
                default:
                    operations = await super.getOperations(property);
            }
        }

        return operations;
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        let inputType: InputFieldTypes | string;
        const searchProperty = Organisation.SEARCH_PROPERTIES.find((p) => p.Property === property);

        if (searchProperty) {
            inputType = searchProperty.InputType;
        } else if (this.isDropDown(property)) {
            inputType = InputFieldTypes.DROPDOWN;
        } else {
            inputType = await super.getInputType(property);
        }

        return inputType;
    }

    private isDropDown(property: string): boolean {
        return property === KIXObjectProperty.VALID_ID;
    }

    public getOperatorDisplayText(operator: string): Promise<string> {
        return SearchOperatorUtil.getText(operator as SearchOperator);
    }

    public async isMultiselect(property: string, operator: SearchOperator | string): Promise<boolean> {
        const result = await super.isMultiselect(property, operator, true);
        if (result !== null && typeof result !== 'undefined') {
            return result;
        }
        return true;
    }

    public async getTreeNodes(property: string, objectIds?: Array<string | number>): Promise<TreeNode[]> {
        let nodes = [];
        switch (property) {
            default:
                nodes = await super.getTreeNodes(property);
                if (!nodes || !nodes.length) {
                    nodes = await OrganisationService.getInstance().getTreeNodes(property, true, true, objectIds);
                }
        }
        return nodes;
    }

    public async getSortAttributeTree(): Promise<TreeNode[]> {
        // TODO: currently not supported
        return;
    }
}