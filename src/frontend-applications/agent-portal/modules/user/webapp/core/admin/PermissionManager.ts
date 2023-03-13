/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    AbstractDynamicFormManager
} from '../../../../base-components/webapp/core/dynamic-form/AbstractDynamicFormManager';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { InputFieldTypes } from '../../../../../modules/base-components/webapp/core/InputFieldTypes';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import {
    DynamicFormOperationsType
} from '../../../../base-components/webapp/core/dynamic-form/DynamicFormOperationsType';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { PermissionType } from '../../../model/PermissionType';

export class PermissionManager extends AbstractDynamicFormManager {

    public objectType: KIXObjectType | string = KIXObjectType.PERMISSION_TYPE;

    public uniqueProperties: boolean = false;

    public resetOperator: boolean = false;

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        return 'SPECIFIC';
    }

    public getSpecificInput(): string {
        return 'permission-input';
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return true;
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const types = [];
        let permissionTypes = await KIXObjectService.loadObjects<PermissionType>(KIXObjectType.PERMISSION_TYPE);
        permissionTypes = permissionTypes.filter((t) => !t.Name.startsWith('Base::'));
        permissionTypes.forEach((t) => types.push([t.ID.toString(), t.Name]));
        return types;
    }

    public async getPropertiesPlaceholder(): Promise<string> {
        return 'Translatable#Type';
    }

    public async getOperationsPlaceholder(): Promise<string> {
        return 'Translatable#Target';
    }

    public async getOpertationsType(property: string): Promise<DynamicFormOperationsType> {
        return DynamicFormOperationsType.STRING;
    }

    public async getOperations(property: string): Promise<any[]> {
        return [];
    }
}
