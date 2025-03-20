/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Version } from './Version';
import { ConfigItemImage } from './ConfigItemImage';
import { ConfigItemHistory } from './ConfigItemHistory';
import { PreparedData } from './PreparedData';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { User } from '../../user/model/User';
import { Link } from '../../links/model/Link';
import { ConfigItemProperty } from './ConfigItemProperty';
import { FilterDataType } from '../../../model/FilterDataType';

export class ConfigItem extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM;

    public ObjectId: string | number;

    public ConfigItemID: number;

    public Name: string;

    public ChangeBy: number;

    public ChangeTime: string;

    public Class: string;

    public CurInciStateID: number;

    public ClassID: number;

    public CurDeplStateID: number;

    public CurDeplStateType: string;

    public Number: string;

    public CreateBy: number;

    public LastVersionID: number;

    public CreateTime: string;

    public CurrentVersion: Version;

    public CurInciState: string;
    public CurDeplState: string;

    public createdBy: User;
    public changedBy: User;

    public Versions: Version[];
    public Images: ConfigItemImage[];
    public History: ConfigItemHistory[];

    public constructor(configItem?: ConfigItem) {
        super(configItem);
        if (configItem) {
            this.ConfigItemID = Number(configItem.ConfigItemID);
            this.ObjectId = this.ConfigItemID;
            this.Name = configItem.Name;
            this.ChangeBy = configItem.ChangeBy;
            this.ChangeTime = configItem.ChangeTime;
            this.Class = configItem.Class;
            this.CurInciStateID = configItem.CurInciStateID;
            this.ClassID = Number(configItem.ClassID);
            this.CurDeplStateID = configItem.CurDeplStateID;
            this.CurDeplStateType = configItem.CurDeplStateType;
            this.Number = configItem.Number;
            this.CreateBy = configItem.CreateBy;
            this.LastVersionID = configItem.LastVersionID;
            this.CreateTime = configItem.CreateTime;
            this.CurrentVersion = configItem.CurrentVersion ? new Version(configItem.CurrentVersion) : null;

            this.LinkTypeName = configItem.LinkTypeName;
            this.CurInciState = configItem.CurInciState;
            this.CurDeplState = configItem.CurDeplState;

            this.createdBy = configItem.createdBy;
            this.changedBy = configItem.changedBy;

            this.Links = configItem.Links ? configItem.Links.map((l) => new Link(l)) : [];
            this.Images = configItem.Images ? configItem.Images.map((i) => new ConfigItemImage(i)) : [];
            this.History = configItem.History ? configItem.History.map((h) => new ConfigItemHistory(h)) : [];

            this.History.sort((a, b) => b.HistoryEntryID - a.HistoryEntryID);

            this.Versions = configItem.Versions ? configItem.Versions.map((v) => new Version(v)) : [];
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
        if (data) {
            let found = false;
            data.forEach((attribute) => {
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
            });
        }
        return preparedData;
    }
}
