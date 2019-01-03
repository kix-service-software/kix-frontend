import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { Version } from "./Version";
import { User } from "../user";
import { ConfigItemImage } from "./ConfigItemImage";
import { ConfigItemHistory } from "./ConfigItemHistory";
import { Link } from "../link";
import { PreparedData } from "./PreparedData";

export class ConfigItem extends KIXObject<ConfigItem> {

    public KIXObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM;

    public ObjectId: string | number;

    public ConfigItemID: number;

    public ChangeBy: number;

    public ChangeTime: string;

    public Class: string;

    public CurInciStateID: number;

    public ClassID: number;

    public CurDeplStateID: number;

    public Number: string;

    public CreateBy: number;

    public LastVersionID: number;

    public CreateTime: string;

    public CurrentVersion: Version;

    public CurInciState: string;
    public CurDeplState: string;

    public createdBy: User;
    public changedBy: User;
    public Name: string;

    public Versions: Version[];
    public Images: ConfigItemImage[];
    public History: ConfigItemHistory[];

    public constructor(configItem?: ConfigItem) {
        super();
        if (configItem) {
            this.ConfigItemID = Number(configItem.ConfigItemID);
            this.ObjectId = this.ConfigItemID;
            this.ChangeBy = configItem.ChangeBy;
            this.ChangeTime = configItem.ChangeTime;
            this.Class = configItem.Class;
            this.CurInciStateID = configItem.CurInciStateID;
            this.ClassID = Number(configItem.ClassID);
            this.CurDeplStateID = configItem.CurDeplStateID;
            this.Number = configItem.Number;
            this.CreateBy = configItem.CreateBy;
            this.LastVersionID = configItem.LastVersionID;
            this.CreateTime = configItem.CreateTime;
            this.CurrentVersion = configItem.CurrentVersion;

            this.LinkTypeName = configItem.LinkTypeName;
            this.CurInciState = configItem.CurInciState;
            this.CurDeplState = configItem.CurDeplState;

            this.createdBy = configItem.createdBy;
            this.changedBy = configItem.changedBy;

            this.Name = configItem.Name;

            this.Links = configItem.Links ? configItem.Links.map((l) => new Link(l)) : [];
            this.Images = configItem.Images ? configItem.Images.map((i) => new ConfigItemImage(i)) : [];
            this.History = configItem.History ? configItem.History.map((h) => new ConfigItemHistory(h)) : [];

            this.Versions = configItem.Versions ? configItem.Versions.map((v) => new Version(v)) : [];

            if (this.CurrentVersion) {
                this.CurrentVersion.isCurrentVersion = true;
                const currentVersion = this.Versions.find((v) => v.VersionID === this.CurrentVersion.VersionID);
                if (currentVersion) {
                    currentVersion.isCurrentVersion = true;
                }
            }
        }
    }

    public equals(configItem: ConfigItem): boolean {
        return this.ConfigItemID === configItem.ConfigItemID;
    }

    public getIdPropertyName(): string {
        return 'ConfigItemID';
    }

    public getPreparedData(key: string, data?: PreparedData[]): PreparedData[] {
        if (!data && this.CurrentVersion) {
            data = this.CurrentVersion.PreparedData;
        }

        const preparedData = [];
        let found = false;
        for (const attribute of data) {
            if (attribute.Key === key) {
                preparedData.push(attribute);
                found = true;
            }

            if (attribute.Sub && !found) {
                const subData = this.getPreparedData(key, attribute.Sub);
                if (subData && subData.length) {
                    subData.forEach((sd) => preparedData.push(sd));
                }
            }
        }
        return preparedData;
    }
}
