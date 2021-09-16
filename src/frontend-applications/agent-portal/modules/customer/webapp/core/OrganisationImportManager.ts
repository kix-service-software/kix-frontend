/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ObjectPropertyValue } from '../../../../model/ObjectPropertyValue';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { Organisation } from '../../model/Organisation';
import { InputFieldTypes } from '../../../../modules/base-components/webapp/core/InputFieldTypes';
import { OrganisationProperty } from '../../model/OrganisationProperty';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { SortUtil } from '../../../../model/SortUtil';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { OrganisationService } from '.';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { ImportManager, ImportPropertyOperator } from '../../../import/webapp/core';

export class OrganisationImportManager extends ImportManager {

    public objectType: KIXObjectType = KIXObjectType.ORGANISATION;

    public reset(): void {
        super.reset();
        this.values.push(new ObjectPropertyValue(
            KIXObjectProperty.VALID_ID, ImportPropertyOperator.REPLACE_EMPTY, [1])
        );
    }

    protected async getSpecificObject(object: any): Promise<Organisation> {
        return new Organisation(object as Organisation);
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

    public async getRequiredProperties(): Promise<string[]> {
        return [OrganisationProperty.NUMBER];
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        return await OrganisationService.getInstance().getTreeNodes(property);
    }

    protected async getExisting(organisation: Organisation): Promise<KIXObject> {
        if (organisation.ObjectId) {
            return super.getExisting(organisation);
        } else {
            const filter = [
                new FilterCriteria(
                    OrganisationProperty.NUMBER, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, organisation.Number
                )
            ];
            const loadingOptions = new KIXObjectLoadingOptions(filter);
            const organisations = await KIXObjectService.loadObjects(
                this.objectType, null, loadingOptions, null, true
            );
            return organisations && !!organisations.length ? organisations[0] : null;
        }
    }
}
