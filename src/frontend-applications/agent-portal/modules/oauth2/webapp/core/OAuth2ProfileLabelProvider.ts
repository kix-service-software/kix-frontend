/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../base-components/webapp/core/LabelProvider';
import { OAuth2Profile } from '../../model/OAuth2Profile';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { OAuth2ProfileProperty } from '../../model/OAuth2ProfileProperty';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';

export class OAuth2ProfileLabelProvider extends LabelProvider<OAuth2Profile> {

    public kixObjectType: KIXObjectType = KIXObjectType.OAUTH2_PROFILE;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public isLabelProviderFor(object: OAuth2Profile): boolean {
        return object instanceof OAuth2Profile;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case OAuth2ProfileProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case OAuth2ProfileProperty.URL_AUTH:
                displayValue = 'Translatable#Authorization URL';
                break;
            case OAuth2ProfileProperty.URL_TOKEN:
                displayValue = 'Translatable#Token URL';
                break;
            case OAuth2ProfileProperty.URL_REDIRECT:
                displayValue = 'Translatable#Redirect URL';
                break;
            case OAuth2ProfileProperty.CLIENT_ID:
                displayValue = 'Translatable#Client ID';
                break;
            case OAuth2ProfileProperty.CLIENT_SECRET:
                displayValue = 'Translatable#Client Secret';
                break;
            case OAuth2ProfileProperty.SCOPE:
                displayValue = 'Translatable#Scope';
                break;
            case OAuth2ProfileProperty.RENEW_AUTH:
                displayValue = 'Translatable#Renew Authorization';
                break;
            case OAuth2ProfileProperty.HAS_ACCESS_TOKEN:
                displayValue = 'Translatable#Has access token';
                break;
            case OAuth2ProfileProperty.ID:
                displayValue = 'Translatable#Id';
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

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        if (property === OAuth2ProfileProperty.RENEW_AUTH) {
            return 'kix-icon-arrow-refresh';
        }
        return;
    }

    public async getDisplayText(
        profile: OAuth2Profile, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = profile[property];

        switch (property) {
            case OAuth2ProfileProperty.ID:
                displayValue = profile.Name;
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

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;

        switch (property) {
            case OAuth2ProfileProperty.HAS_ACCESS_TOKEN:
                displayValue = value ? 'Translatable#Yes' : 'Translatable#No';
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

    public getDisplayTextClasses(object: OAuth2Profile, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: OAuth2Profile): string[] {
        return [];
    }

    public async getObjectText(
        profile: OAuth2Profile, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return profile.Name;
    }

    public getObjectAdditionalText(object: OAuth2Profile, translatable: boolean = true): string {
        return '';
    }

    public async getObjectTooltip(object: OAuth2Profile, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(object.Name);
        }
        return object.Name;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#OAuth2 Profiles' : 'Translatable#OAuth2 Profile'
            );
        }
        return plural ? 'OAuth2 Profiles' : 'OAuth2 Profile';
    }

    public async getIcons(object: OAuth2Profile, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        if (property === OAuth2ProfileProperty.HAS_ACCESS_TOKEN && object?.HasAccessToken) {
            icons.push('kix-icon-check');
        }
        return icons;
    }
}

