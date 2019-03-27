import { ILabelProvider } from "../ILabelProvider";
import { Channel, KIXObjectType, ObjectIcon, ChannelProperty, DateTimeUtil } from "../../model";
import { ContextService } from "../context";

export class ChannelLabelProvider implements ILabelProvider<Channel> {

    public kixObjectType: KIXObjectType = KIXObjectType.CHANNEL;

    public isLabelProviderFor(channel: Channel): boolean {
        return channel instanceof Channel;
    }

    public async getPropertyText(property: string, short?: boolean): Promise<string> {
        let displayValue = property;

        switch (property) {
            case ChannelProperty.NAME:
                displayValue = 'Name';
                break;
            case ChannelProperty.ID:
                displayValue = 'Id';
                break;
            case ChannelProperty.CREATE_BY:
                displayValue = 'Erstellt von';
                break;
            case ChannelProperty.CREATE_TIME:
                displayValue = 'Erstellt am';
                break;
            case ChannelProperty.CHANGED_BY:
                displayValue = 'Geändert von';
                break;
            case ChannelProperty.CHANGE_TIME:
                displayValue = 'Geändert am';
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(channel: Channel, property: string): Promise<string> {
        let displayValue = channel[property];

        switch (property) {
            case ChannelProperty.NAME:
                if (channel.Name === 'note') {
                    displayValue = 'Notiz';
                }
                if (channel.Name === 'email') {
                    displayValue = 'E-Mail';
                }
                break;
            default:
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

    public async getObjectText(channel: Channel, id?: boolean, title?: boolean): Promise<string> {
        return 'Kanal';
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

    public getObjectName(plural?: boolean): string {
        return plural ? 'Kanal' : 'Kanäle';
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
