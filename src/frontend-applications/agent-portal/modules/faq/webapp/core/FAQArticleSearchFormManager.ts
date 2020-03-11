/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FAQService } from "./FAQService";
import {
    AbstractDynamicFormManager
} from "../../../base-components/webapp/core/dynamic-form/AbstractDynamicFormManager";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { SearchProperty } from "../../../search/model/SearchProperty";
import { FAQArticleProperty } from "../../model/FAQArticleProperty";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { AuthenticationSocketClient } from "../../../../modules/base-components/webapp/core/AuthenticationSocketClient";
import { UIComponentPermission } from "../../../../model/UIComponentPermission";
import { CRUD } from "../../../../../../server/model/rest/CRUD";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { SearchDefinition, SearchOperatorUtil } from "../../../search/webapp/core";
import { InputFieldTypes } from "../../../../modules/base-components/webapp/core/InputFieldTypes";
import { TreeNode } from "../../../base-components/webapp/core/tree";


export class FAQArticleSearchFormManager extends AbstractDynamicFormManager {

    public objectType: KIXObjectType | string = KIXObjectType.FAQ_ARTICLE;

    protected readPermissions: Map<string, boolean> = new Map();

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [
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
        } else if (this.isDateTime(property)) {
            operations = SearchDefinition.getDateTimeOperators();
        } else {
            operations = SearchDefinition.getStringOperators();
        }

        return operations;
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        if (this.isDropDown(property)) {
            return InputFieldTypes.DROPDOWN;
        } else if (this.isDateTime(property)) {
            return InputFieldTypes.DATE_TIME;
        }

        return InputFieldTypes.TEXT;
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

    public async getOperatorDisplayText(operator: string): Promise<string> {
        return await SearchOperatorUtil.getText(operator as SearchOperator);
    }

    public async isMultiselect(property: string): Promise<boolean> {
        return true;
    }

    public async getInputComponents(): Promise<Map<string, string>> {
        const components = new Map<string, string>();
        components.set(FAQArticleProperty.LANGUAGE, 'language-input');
        return components;
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        const nodes = await FAQService.getInstance().getTreeNodes(property, true, true);
        return nodes;
    }

}
