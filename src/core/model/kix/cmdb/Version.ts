import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { PreparedData } from "./PreparedData";

export class Version extends KIXObject<Version> {

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
    public Data: any = {};
    public PreparedData: PreparedData[] = [];
    public isCurrentVersion: boolean = false;
    public countNumber: number;

    public constructor(version?: Version) {
        super();
        if (version) {
            this.VersionID = version.VersionID;
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
            this.isCurrentVersion = version.isCurrentVersion;
            this.countNumber = version.countNumber;
        }
    }

    public equals(version: Version): boolean {
        return this.VersionID === version.VersionID;
    }

    public getIdPropertyName(): string {
        return 'VersionID';
    }
}
