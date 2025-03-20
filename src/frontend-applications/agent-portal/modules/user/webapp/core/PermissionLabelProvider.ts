/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { Role } from '../../model/Role';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { PermissionProperty } from '../../model/PermissionProperty';
import { PermissionType } from '../../model/PermissionType';
import { Permission } from '../../model/Permission';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class PermissionLabelProvider extends LabelProvider<Permission> {

    public kixObjectType: KIXObjectType | string = KIXObjectType.PERMISSION;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof Permission || object?.KIXObjectType === this.kixObjectType;
    }

    public isLabelProviderForType(objectType: KIXObjectType | string): boolean {
        return objectType === KIXObjectType.PERMISSION || objectType === KIXObjectType.ROLE_PERMISSION;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case PermissionProperty.TYPE_ID:
                displayValue = 'Translatable#Layer';
                break;
            case PermissionProperty.RoleID:
                displayValue = 'Translatable#Role';
                break;
            case PermissionProperty.IS_REQUIRED:
                return 'Required';
            case PermissionProperty.TARGET:
                displayValue = 'Translatable#Target';
                break;
            case PermissionProperty.ID:
                displayValue = 'Translatable#Icon';
                break;
            case PermissionProperty.VALUE:
                displayValue = 'Translatable#Permission';
                break;
            case PermissionProperty.CREATE:
                displayValue = 'Create';
                translatable = false;
                break;
            case PermissionProperty.READ:
                displayValue = 'Read';
                translatable = false;
                break;
            case PermissionProperty.UPDATE:
                displayValue = 'Update';
                translatable = false;
                break;
            case PermissionProperty.DELETE:
                displayValue = 'Delete';
                translatable = false;
                break;
            case PermissionProperty.DENY:
                displayValue = 'Deny';
                translatable = false;
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getDisplayText(
        permission: Permission, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = permission[property];

        switch (property) {
            case PermissionProperty.TYPE_ID:
                const types = await KIXObjectService.loadObjects<PermissionType>(
                    KIXObjectType.PERMISSION_TYPE, null, null, null, true
                ).catch((error) => [] as PermissionType[]);
                if (types && !!types.length) {
                    const type = types.find((t) => t.ID === permission.TypeID);
                    displayValue = type ? type.Name : permission.TypeID;
                }
                break;
            case PermissionProperty.RoleID:
                const roles = await KIXObjectService.loadObjects<Role>(
                    KIXObjectType.ROLE, [permission.RoleID]
                );
                if (roles && roles.length) {
                    displayValue = roles[0].Name;
                }
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case PermissionProperty.TYPE_ID:
                const types = await KIXObjectService.loadObjects<PermissionType>(
                    KIXObjectType.PERMISSION_TYPE, null, null, null, true
                ).catch((error) => [] as PermissionType[]);
                if (types && !!types.length) {
                    const type = types.find((t) => t.ID === value);
                    displayValue = type ? type.Name : value;
                }
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getObjectText(
        object: Permission, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return await this.getObjectName(false, translatable);
    }

    public getObjectIcon(object?: Permission): string | ObjectIcon {
        return new ObjectIcon(null, 'Permission', object.ID);
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Permissions' : 'Translatable#Permission'
            );
        }
        return plural ? 'Permissions' : 'Permission';
    }

    public async getObjectTooltip(object: Permission): Promise<string> {
        return object.ID.toString();
    }

    public async getIcons(
        object: Permission, property: string, value?: any
    ): Promise<Array<string | ObjectIcon>> {
        if (property === PermissionProperty.ID) {
            return [new ObjectIcon(null, 'Permission', object.ID)];
        } else if (property === PermissionProperty.IS_REQUIRED) {
            return value ? ['kix-icon-check'] : null;
        }
        return null;
    }

}
