/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FAQService } from './FAQService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { FAQArticleProperty } from '../../model/FAQArticleProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { AuthenticationSocketClient } from '../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { SearchDefinition, SearchOperatorUtil } from '../../../search/webapp/core';
import { InputFieldTypes } from '../../../../modules/base-components/webapp/core/InputFieldTypes';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { SearchFormManager } from '../../../base-components/webapp/core/SearchFormManager';


export class FAQArticleSearchFormManager extends SearchFormManager {

    public objectType: KIXObjectType | string = KIXObjectType.FAQ_ARTICLE;

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
            [FAQArticleProperty.NUMBER, null],
            [FAQArticleProperty.TITLE, null],
            [FAQArticleProperty.CUSTOMER_VISIBLE, null],
            [FAQArticleProperty.FIELD_1, null],
            [FAQArticleProperty.FIELD_2, null],
            [FAQArticleProperty.FIELD_3, null],
            [FAQArticleProperty.FIELD_6, null],
            [FAQArticleProperty.CREATED, null],
            [FAQArticleProperty.CHANGED, null]
        ];

        if (await this.checkReadPermissions('system/faq/categories')) {
            properties.push([FAQArticleProperty.CATEGORY_ID, null]);
        }

        if (await this.checkReadPermissions('system/config')) {
            properties.push([FAQArticleProperty.LANGUAGE, null]);
        }

        if (await this.checkReadPermissions('system/valid')) {
            properties.push([KIXObjectProperty.VALID_ID, null]);
        }

        if (await this.checkReadPermissions('faq/articles/keywords')) {
            properties.push([FAQArticleProperty.KEYWORDS, null]);
        }

        if (await this.checkReadPermissions('system/users')) {
            properties.push([FAQArticleProperty.CREATED_BY, null]);
            properties.push([FAQArticleProperty.CHANGED_BY, null]);
        }

        for (const p of properties) {
            const label = await LabelService.getInstance().getPropertyText(
                p[0], KIXObjectType.FAQ_ARTICLE
            );
            p[1] = label;
        }

        const superProperties = await super.getProperties(this.validDynamicFields);
        properties = [...properties, ...superProperties];

        properties = properties.filter(
            (p) => !this.ignoreProperties.some((ip) => ip === p[0])
        );

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
        let operations: Array<string | SearchOperator> = [];

        if (property === FAQArticleProperty.CUSTOMER_VISIBLE) {
            operations = [SearchOperator.EQUALS];
        } else if (property === SearchProperty.FULLTEXT) {
            operations = [SearchOperator.LIKE];
        } else if (this.isDropDown(property)) {
            operations = [SearchOperator.IN];
        } else if (this.isDateTime(property)) {
            operations = SearchDefinition.getDateTimeOperators();
        } else {
            operations = await super.getOperations(property);
            if (!operations || !operations.length) {
                operations = SearchDefinition.getStringOperators();
            }
        }

        return operations;
    }

    public async getInputType(property: string, operator?: SearchOperator): Promise<InputFieldTypes | string> {
        let inputType: InputFieldTypes | string;

        if (this.isDropDown(property)) {
            inputType = InputFieldTypes.DROPDOWN;
        } else if (this.isDateTime(property)) {
            inputType = InputFieldTypes.DATE_TIME;
        } else {
            inputType = await super.getInputType(property);
        }

        if (inputType === InputFieldTypes.DATE || inputType === InputFieldTypes.DATE_TIME) {
            const relativeDateTimeOperators = SearchDefinition.getRelativeDateTimeOperators();
            if (operator && relativeDateTimeOperators.includes(operator))
                inputType = InputFieldTypes.TEXT;
        }

        return inputType;
    }

    private isDropDown(property: string): boolean {
        return property === FAQArticleProperty.APPROVED
            || property === FAQArticleProperty.CATEGORY_ID
            || property === KIXObjectProperty.VALID_ID
            || property === FAQArticleProperty.LANGUAGE
            || property === FAQArticleProperty.KEYWORDS
            || property === FAQArticleProperty.CREATED_BY
            || property === FAQArticleProperty.CHANGED_BY
            || property === FAQArticleProperty.CUSTOMER_VISIBLE;
    }

    private isDateTime(property: string): boolean {
        return property === FAQArticleProperty.CREATED
            || property === FAQArticleProperty.CHANGED;
    }

    public getOperatorDisplayText(operator: string): Promise<string> {
        return SearchOperatorUtil.getText(operator as SearchOperator);
    }

    public async isMultiselect(property: string, operator: SearchOperator | string): Promise<boolean> {
        return property !== FAQArticleProperty.CUSTOMER_VISIBLE;
    }

    public async getInputComponents(): Promise<Map<string, string>> {
        const components = new Map<string, string>();
        components.set(FAQArticleProperty.LANGUAGE, 'language-input');
        return components;
    }

    public async getTreeNodes(property: string, objectIds?: Array<string | number>): Promise<TreeNode[]> {
        let nodes = await super.getTreeNodes(property);
        if (!nodes || !nodes.length) {
            nodes = await FAQService.getInstance().getTreeNodes(property, true, true, objectIds);
        }
        return nodes;
    }

    public async getSortAttributeTree(): Promise<TreeNode[]> {
        // TODO: currently not supported
        return;
    }

}
