/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { Channel } from '../../model/Channel';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ChannelProperty } from '../../model/ChannelProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class ChannelLabelProvider extends LabelProvider<Channel> {

    public kixObjectType: KIXObjectType = KIXObjectType.CHANNEL;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof Channel || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;

        switch (property) {
            case ChannelProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case ChannelProperty.ID:
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

    public async getDisplayText(
        channel: Channel, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = channel[property];

        switch (property) {
            case ChannelProperty.NAME:
                if (channel.Name === 'note') {
                    displayValue = await TranslationService.translate('Translatable#Note', []);
                }
                if (channel.Name === 'email') {
                    displayValue = await TranslationService.translate('Translatable#Email', []);
                }
                break;
            default:
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getObjectText(
        channel: Channel, id?: boolean, title?: boolean, translatable: boolean = true
    ): Promise<string> {
        return translatable ? await TranslationService.translate(channel.Name) : channel.Name;
    }

    public getObjectAdditionalText(channel: Channel): string {
        return channel.Name;
    }

    public getObjectIcon(channel?: Channel): string | ObjectIcon {
        if (channel) {
            if (channel.Name === 'note') {
                return 'kix-icon-new-note';
            }
            if (channel.Name === 'email') {
                return 'kix-icon-new-mail';
            }
        }
        return null;
    }

    public async getObjectName(plural?: boolean, translatable?: boolean): Promise<string> {
        if (plural) {
            const channelsLabel = translatable
                ? await TranslationService.translate('Translatable#Channels')
                : 'Channels';
            return channelsLabel;
        }

        const channelLabel = translatable ? await TranslationService.translate('Translatable#Channel') : 'Channel';
        return channelLabel;
    }

    public async getObjectTooltip(channel: Channel, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                channel.ObjectId.toString()
            );
        }
        return channel.ObjectId.toString();
    }

    public async getIcons(
        channel: Channel, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === ChannelProperty.ID) {
            if (channel.Name === 'note') {
                return ['kix-icon-new-note'];
            }
            if (channel.Name === 'email') {
                return ['kix-icon-new-mail'];
            }
        }
        return null;
    }

}
