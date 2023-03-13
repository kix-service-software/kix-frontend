/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractDynamicFormManager } from '../../../../base-components/webapp/core/dynamic-form/AbstractDynamicFormManager';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { DynamicFormOperationsType } from '../../../../base-components/webapp/core/dynamic-form/DynamicFormOperationsType';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { Role } from '../../../model/Role';
import { BasePermission } from '../../../model/BasePermission';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';

export class BasePermissionManager extends AbstractDynamicFormManager {

    public objectType: KIXObjectType | string = KIXObjectType.ROLE_PERMISSION;

    public uniqueProperties: boolean = true;

    public resetOperator: boolean = false;

    public showValueInput(value: ObjectPropertyValue): boolean {
        return false;
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const roles = [];
        const roleObjects = await KIXObjectService.loadObjects<Role>(KIXObjectType.ROLE);
        roleObjects.forEach((r) => roles.push([r.ID.toString(), r.Name]));
        return roles;
    }

    public async getPropertiesPlaceholder(): Promise<string> {
        return 'Translatable#Role';
    }

    public async getOperationsPlaceholder(): Promise<string> {
        return 'Translatable#Permission';
    }

    public async getOperations(property: string): Promise<any[]> {
        return [BasePermission.READ, BasePermission.WRITE, BasePermission.READ_WRITE];
    }

    public async getOperatorDisplayText(operator: string): Promise<string> {
        let displayString = operator;
        switch (operator) {
            case BasePermission.READ:
                displayString = await TranslationService.translate('Translatable#Read');
                break;
            case BasePermission.WRITE:
                displayString = await TranslationService.translate('Translatable#Write');
                break;
            case BasePermission.READ_WRITE:
                displayString = await TranslationService.translate('Translatable#Read & Write');
                break;
            default:

        }

        return displayString;
    }
}
