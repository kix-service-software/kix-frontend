/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { PreparedData } from './PreparedData';
import { ConfigItemClassDefinition } from './ConfigItemClassDefinition';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class Version extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION;

    public ObjectId: string | number;

    public CreateTime: string;
    public CurDeplStateType: string;
    public DeplStateType: string;
    public CurInciStateID: number;
    public DeplStateID: number;
    public VersionID: number;
    public Number: string;
    public ClassID: number;
    public DeplState: string;
    public CurDeplState: string;
    public InciState: string;
    public CurDeplStateID: number;
    public Name: string;
    public ConfigItemID: number;
    public InciStateType: string;
    public InciStateID: number;
    public CurInciState: string;
    public CreateBy: number;
    public Class: string;
    public CurInciStateType: string;
    public Data: any;
    public PreparedData: PreparedData[] = [];
    public IsLastVersion: boolean = false;
    public countNumber: number;
    public Definition: ConfigItemClassDefinition;

    public constructor(version?: Version) {
        super();
        if (version) {
            this.VersionID = Number(version.VersionID);
            this.ObjectId = this.VersionID;
            this.CreateTime = version.CreateTime;
            this.CurDeplStateType = version.CurDeplStateType;
            this.DeplStateType = version.DeplStateType;
            this.CurInciStateID = version.CurInciStateID;
            this.DeplStateID = version.DeplStateID;
            this.Number = version.Number;
            this.ClassID = version.ClassID;
            this.DeplState = version.DeplState;
            this.CurDeplState = version.CurDeplState;
            this.InciState = version.InciState;
            this.CurDeplStateID = version.CurDeplStateID;
            this.Name = version.Name;
            this.ConfigItemID = version.ConfigItemID;
            this.InciStateType = version.InciStateType;
            this.InciStateID = version.InciStateID;
            this.CurInciState = version.CurInciState;
            this.CreateBy = version.CreateBy;
            this.Class = version.Class;
            this.CurInciStateType = version.CurInciStateType;
            this.Data = version.Data;
            this.PreparedData = version.PreparedData;
            this.IsLastVersion = Boolean(version.IsLastVersion);
            this.countNumber = version.countNumber;
            this.Definition = version.Definition;
        }
    }

    public equals(version: Version): boolean {
        return this.VersionID === version.VersionID;
    }

    public getIdPropertyName(): string {
        return 'VersionID';
    }
}
