import { ILabelProvider } from '../ILabelProvider';
import { Channel, KIXObjectType, ObjectIcon, ChannelProperty } from '../../model';
import { TranslationService } from '../i18n/TranslationService';

export class ChannelLabelProvider implements ILabelProvider<Channel> {

    public kixObjectType: KIXObjectType = KIXObjectType.CHANNEL;

    public isLabelProviderFor(channel: Channel): boolean {
        return channel instanceof Channel;
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
            case ChannelProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case ChannelProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case ChannelProperty.CHANGED_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case ChannelProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            default:
                displayValue = property;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
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
                    displayValue = await TranslationService.translate('Translatable#E-Mail', []);
                }
                break;
            default:
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public getDisplayTextClasses(channel: Channel, property: string): string[] {
        return [];
    }

    public getObjectClasses(channel: Channel): string[] {
        return [];
    }

    public async getObjectText(
        channel: Channel, id?: boolean, title?: boolean, translatable: boolean = true
    ): Promise<string> {
        return translatable ? await TranslationService.translate('Translatable#Channel') : 'Channel';
    }

    public getObjectAdditionalText(channel: Channel): string {
        return channel.Name;
    }

    public getObjectIcon(channel?: Channel): string | ObjectIcon {
        if (channel.Name === 'note') {
            return 'kix-icon-new-note';
        }
        if (channel.Name === 'email') {
            return 'kix-icon-new-mail';
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

    public getObjectTooltip(channel: Channel): string {
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
