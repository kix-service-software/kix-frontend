/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { UserProperty } from '../../../../user/model/UserProperty';
import { ContactProperty } from '../../../model/ContactProperty';
import { ContactService } from '../ContactService';

export class ContactImportManager extends ImportManager {

    public objectType: KIXObjectType = KIXObjectType.CONTACT;

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
            case ContactProperty.COMMENT:
                return InputFieldTypes.TEXT_AREA;
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                return InputFieldTypes.OBJECT_REFERENCE;
            default:
                return super.getInputType(property);
        }
    }

    public async getInputTypeOptions(
        property: ContactProperty, operator: ImportPropertyOperator
    ): Promise<Array<[string, any]>> {
        switch (property) {
            case ContactProperty.COMMENT:
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
            ContactProperty.CITY,
            ContactProperty.COMMENT,
            ContactProperty.COUNTRY,
            ContactProperty.EMAIL,
            ContactProperty.FAX,
            ContactProperty.FIRSTNAME,
            ContactProperty.LASTNAME,
            ContactProperty.MOBILE,
            ContactProperty.PHONE,
            ContactProperty.PRIMARY_ORGANISATION_ID,
            ContactProperty.STREET,
            ContactProperty.TITLE,
            ContactProperty.ZIP,
            KIXObjectProperty.VALID_ID,
            UserProperty.IS_AGENT,
            UserProperty.IS_CUSTOMER,
            UserProperty.USER_LOGIN
        ];
        for (const attribute of attributes) {
            const label = await LabelService.getInstance().getPropertyText(attribute, this.objectType);
            properties.push([attribute, label]);
        }

        properties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]));
        return properties;
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        return await ContactService.getInstance().getTreeNodes(property);
    }
}
