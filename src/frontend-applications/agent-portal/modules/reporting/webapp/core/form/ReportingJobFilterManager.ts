/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractDynamicFormManager } from '../../../../base-components/webapp/core/dynamic-form';
import { InputFieldTypes } from '../../../../base-components/webapp/core/InputFieldTypes';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { SearchDefinition } from '../../../../search/webapp/core';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ReportDefinitionProperty } from '../../../model/ReportDefinitionProperty';

export class ReportingJobFilterManager extends AbstractDynamicFormManager {

    public objectType: string = KIXObjectType.REPORT_DEFINITION;

    public async getProperties(): Promise<Array<[string, string]>> {
        let properties: Array<[string, string]> = [
            [ReportDefinitionProperty.NAME, null],
            [ReportDefinitionProperty.IS_PERIODIC, null],
        ];

        for (const p of properties) {
            const label = await LabelService.getInstance().getPropertyText(
                p[0], KIXObjectType.REPORT_DEFINITION
            );
            p[1] = label;
        }

        const superProperties = await super.getProperties();
        properties = [...properties, ...superProperties];

        return properties.sort((a, b) => a[1].localeCompare(b[1]));
    }

    public async getOperations(property: string): Promise<Array<string | SearchOperator>> {
        let operations: Array<string | SearchOperator> = [];

        switch (property) {
            case ReportDefinitionProperty.NAME:
                operations = SearchDefinition.getStringOperators();
                break;
            case ReportDefinitionProperty.IS_PERIODIC:
                operations = [SearchOperator.EQUALS];
                break;
            default:
                operations = await super.getOperations(property);
        }

        return operations;
    }

    public async getInputType(property: string, operator?: SearchOperator): Promise<InputFieldTypes | string> {
        let inputType: InputFieldTypes | string;

        if (property === ReportDefinitionProperty.IS_PERIODIC) {
            inputType = InputFieldTypes.DROPDOWN;
        } else {
            inputType = await super.getInputType(property);
        }

        return inputType;
    }

    public async isMultiselect(property: string, operator: SearchOperator | string): Promise<boolean> {
        const result = await super.isMultiselect(property, operator, true);
        if (result !== null && typeof result !== 'undefined') {
            return result;
        }

        if (property === ReportDefinitionProperty.IS_PERIODIC) {
            return false;
        }

        return true;
    }

    public async getTreeNodes(property: string, objectIds?: Array<string | number>): Promise<TreeNode[]> {
        let nodes = [];
        switch (property) {
            case ReportDefinitionProperty.IS_PERIODIC:
                const no = await TranslationService.translate('No');
                const yes = await TranslationService.translate('Yes');
                nodes = [
                    new TreeNode(0, no),
                    new TreeNode(1, yes)
                ];
                break;
            default:
        }
        return nodes;
    }
}