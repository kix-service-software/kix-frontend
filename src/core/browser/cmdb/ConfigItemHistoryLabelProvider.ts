import { ILabelProvider } from "..";
import { ConfigItemHistory, DateTimeUtil, ObjectIcon, KIXObjectType, KIXObject } from "../../model";
import { ContextService } from "../context";

export class ConfigItemHistoryLabelProvider implements ILabelProvider<ConfigItemHistory> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_HISTORY;

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public async getPropertyText(property: string, object?: KIXObject): Promise<string> {
        let text = property;
        switch (property) {
            case 'HistoryType':
                text = 'Aktion';
                break;
            case 'Comment':
                text = 'Kommentar';
                break;
            case 'CreateBy':
                text = 'Benutzer';
                break;
            case 'CreateTime':
                text = 'Erstellt am';
                break;
            case 'Content':
                text = 'Zur Version';
                break;
            default:
                text = property;
        }
        return text;
    }

    public async getDisplayText(historyEntry: ConfigItemHistory, property: string): Promise<string> {
        let displayValue = property.toString();

        const objectData = ContextService.getInstance().getObjectData();

        switch (property) {
            case 'CreateBy':
                const user = objectData.users.find((u) => u.UserID === historyEntry[property]);
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            case 'CreateTime':
                displayValue = DateTimeUtil.getLocalDateTimeString(historyEntry[property]);
                break;
            case 'Content':
                displayValue = historyEntry.VersionID ? 'Zur Version' : '';
                break;
            default:
                displayValue = historyEntry[property];
        }

        return displayValue;
    }

    public getDisplayTextClasses(object: ConfigItemHistory, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: ConfigItemHistory): string[] {
        return [];
    }

    public isLabelProviderFor(object: ConfigItemHistory): boolean {
        return object instanceof ConfigItemHistory;
    }

    public async getObjectText(object: ConfigItemHistory): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public getObjectAdditionalText(object: ConfigItemHistory): string {
        throw new Error("Method not implemented.");
    }

    public getObjectIcon(object: ConfigItemHistory): string | ObjectIcon {
        throw new Error("Method not implemented.");
    }

    public getObjectTooltip(object: ConfigItemHistory): string {
        throw new Error("Method not implemented.");
    }

    public getObjectName(): string {
        return "Config Item Historie";
    }

    public async getIcons(object: ConfigItemHistory, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        if (property === 'Content' && object.VersionID) {
            icons.push('kix-icon-open-right');
        }
        return icons;
    }
}
