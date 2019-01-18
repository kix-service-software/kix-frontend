import { ILabelProvider } from "..";
import { Version, DateTimeUtil, ObjectIcon, KIXObjectType, VersionProperty, ConfigItemClass } from "../../model";
import { ContextService } from "../context";
import { ServiceRegistry, KIXObjectService } from "../kix";
import { CMDBService } from "./CMDBService";

export class ConfigItemVersionLabelProvider implements ILabelProvider<Version> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION;

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public async getPropertyText(property: string, version?: Version): Promise<string> {
        let text = property;
        switch (property) {
            case VersionProperty.COUNT_NUMBER:
                text = 'Nr.';
                break;
            case VersionProperty.CREATE_BY:
                text = 'Erstellt von';
                break;
            case VersionProperty.CREATE_TIME:
                text = 'Erstellt am';
                break;
            case VersionProperty.CURRENT:
                text = 'Aktuelle Version';
                break;
            default:
                if (version) {
                    text = await this.getVersionProperty(property, version);
                } else {
                    text = property;
                }

        }
        return text;
    }

    private async getVersionProperty(property: string, version: Version): Promise<string> {
        if (version.ClassID) {
            const classes = await KIXObjectService.loadObjects<ConfigItemClass>(
                KIXObjectType.CONFIG_ITEM_CLASS, [version.ClassID]
            );

            if (classes && classes.length) {
                return property;
            }
        } else {
            return property;
        }
    }

    public async getDisplayText(version: Version, property: string): Promise<string> {
        let displayValue = property.toString();

        const objectData = ContextService.getInstance().getObjectData();

        switch (property) {
            case VersionProperty.COUNT_NUMBER:
                displayValue = version.countNumber ? version.countNumber.toString() : '';
            case VersionProperty.CREATE_BY:
                const user = objectData.users.find((u) => u.UserID === version[property]);
                if (user) {
                    displayValue = user.UserFullname;
                }
                break;
            case VersionProperty.CREATE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(version[property]);
                break;
            case VersionProperty.CURRENT:
                displayValue = version.isCurrentVersion ? '(aktuelle Version)' : '';
                break;
            default:
                displayValue = version[property];
        }

        return displayValue;
    }

    public getDisplayTextClasses(object: Version, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: Version): string[] {
        return [];
    }

    public isLabelProviderFor(object: Version): boolean {
        return object instanceof Version;
    }

    public async getObjectText(object: Version): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public getObjectAdditionalText(object: Version): string {
        throw new Error("Method not implemented.");
    }

    public getObjectIcon(object: Version): string | ObjectIcon {
        throw new Error("Method not implemented.");
    }

    public getObjectTooltip(object: Version): string {
        throw new Error("Method not implemented.");
    }

    public getObjectName(): string {
        return "Config Item Version";
    }

    public async getIcons(object: Version, property: string): Promise<Array<string | ObjectIcon>> {
        return null;
    }

}
