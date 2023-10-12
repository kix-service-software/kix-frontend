/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { SortUtil } from '../../../../../model/SortUtil';
import { InputFieldTypes } from '../../../../base-components/webapp/core/InputFieldTypes';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { ImportManager, ImportPropertyOperator } from '../../../../import/webapp/core';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { OrganisationProperty } from '../../../model/OrganisationProperty';
import { OrganisationService } from '../OrganisationService';

export class OrganisationImportManager extends ImportManager {

    public objectType: KIXObjectType = KIXObjectType.ORGANISATION;

    public reset(): void {
        super.reset();
        this.values.push(new ObjectPropertyValue(
            KIXObjectProperty.VALID_ID, ImportPropertyOperator.REPLACE_EMPTY, [1])
        );
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                return InputFieldTypes.DROPDOWN;
            case OrganisationProperty.COMMENT:
                return InputFieldTypes.TEXT_AREA;
            default:
                return super.getInputType(property);
        }
    }

    public async getInputTypeOptions(
        property: OrganisationProperty, operator: ImportPropertyOperator
    ): Promise<Array<[string, any]>> {
        switch (property) {
            case OrganisationProperty.COMMENT:
                return [
                    ['maxLength', 250]
                ];
            default:
                return super.getInputTypeOptions(property, operator);
        }
    }

    public async isMultiselect(
        property: string, operator: SearchOperator | string, forSearch?: boolean
    ): Promise<boolean> {
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                return false;
            default:
                return super.isMultiselect(property, operator, forSearch);
        }
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [];
        const attributes = [
            OrganisationProperty.NAME,
            OrganisationProperty.URL,
            OrganisationProperty.STREET,
            OrganisationProperty.CITY,
            OrganisationProperty.ZIP,
            OrganisationProperty.COUNTRY,
            OrganisationProperty.COMMENT,
            KIXObjectProperty.VALID_ID
        ];
        for (const attribute of attributes) {
            const label = await LabelService.getInstance().getPropertyText(attribute, this.objectType);
            properties.push([attribute, label]);
        }

        properties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]));
        return properties;
    }



    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        return await OrganisationService.getInstance().getTreeNodes(property);
    }
}
