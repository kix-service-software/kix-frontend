/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { Role } from '../../model/Role';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { RoleProperty } from '../../model/RoleProperty';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class RoleLabelProvider extends LabelProvider<Role> {

    public kixObjectType: KIXObjectType | string = KIXObjectType.ROLE;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof Role || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case RoleProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case RoleProperty.ID:
                displayValue = 'Translatable#Icon';
                break;
            case RoleProperty.USAGE_CONTEXT:
                displayValue = 'Translatable#Usage Context';
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
        role: Role, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = role[property];

        switch (property) {
            case RoleProperty.NAME:
            case RoleProperty.COMMENT:
                translatable = false;
                break;
            case RoleProperty.ID:
                displayValue = role.Name;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getObjectText(role: Role, id?: boolean, title?: boolean, translatable?: boolean): Promise<string> {
        return role.Name;
    }

    public getObjectIcon(role?: Role): string | ObjectIcon {
        return new ObjectIcon(null, 'Role', role.ID, null, null, 'far fa-user-circle');
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Roles' : 'Translatable#Role'
            );
        }
        return plural ? 'Roles' : 'Role';
    }

    public async getObjectTooltip(role: Role, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(role.Name);
        }
        return role.Name;
    }

    public async getIcons(
        role: Role, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === RoleProperty.ID) {
            return [new ObjectIcon(null, 'Role', role.ID)];
        }
        return null;
    }

}
