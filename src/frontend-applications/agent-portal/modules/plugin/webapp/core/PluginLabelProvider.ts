/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { Plugin } from '../../model/Plugin';
import { PluginProperty } from '../../model/PluginProperty';

export class PluginLabelProvider extends LabelProvider<Plugin> {

    public kixObjectType: KIXObjectType = KIXObjectType.PLUGIN;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof Plugin || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case PluginProperty.FULL_VERSION:
                displayValue = 'Translatable#Version';
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

    public async getExportPropertyValue(property: string, value: any): Promise<any> {
        let newValue = value;
        switch (property) {
            default:
                newValue = await super.getExportPropertyValue(property, value);
        }
        return newValue;
    }

    public async getDisplayText(
        plugin: Plugin, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = typeof defaultValue !== 'undefined' && defaultValue !== null
            ? defaultValue : plugin[property];

        switch (property) {
            case PluginProperty.FULL_VERSION:
                displayValue = plugin.Version + '.' + plugin.BuildNumber + '-' + (plugin.PatchNumber ? plugin.PatchNumber : 0);
                break;
            default:
                displayValue = await super.getDisplayText(plugin, property, defaultValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-combs';
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (plural) {
            const pluginsLabel = translatable
                ? await TranslationService.translate('Translatable#Plugins')
                : 'Plugins';
            return pluginsLabel;
        }

        const pluginLabel = translatable ?
            await TranslationService.translate('Translatable#Plugin') : 'Plugin';
        return pluginLabel;
    }

    public async getObjectText(
        object: Plugin, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return object.Product;
    }

    public getObjectIcon(object?: Plugin): string | ObjectIcon {
        if (object) {
            return new ObjectIcon(null, KIXObjectType.PLUGIN, object.Product, null, null, 'kix-icon-combs');
        } else {
            return 'kix-icon-combs';
        }
    }
}

