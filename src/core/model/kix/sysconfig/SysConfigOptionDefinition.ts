import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class SysConfigOptionDefinition extends KIXObject<SysConfigOptionDefinition> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;

    public Name: string;

    public Value: any;

    public Default: string[];

    public Description: string;

    public Group: string;

    public IsModified: number;

    public IsRequired: number;

    public Level: number;

    public Setting: any;

    public Type: string;


    public constructor(sysConfigOptionDefinition?: SysConfigOptionDefinition) {
        super(sysConfigOptionDefinition);
        if (sysConfigOptionDefinition) {
            this.Name = sysConfigOptionDefinition.Name;
            this.ObjectId = this.Name;
            this.Value = sysConfigOptionDefinition.Value;
            this.Default = sysConfigOptionDefinition.Default;
            this.Description = sysConfigOptionDefinition.Description;
            this.Group = sysConfigOptionDefinition.Group;
            this.IsModified = sysConfigOptionDefinition.IsModified;
            this.IsRequired = sysConfigOptionDefinition.IsRequired;
            this.Level = sysConfigOptionDefinition.Level;
            this.Setting = sysConfigOptionDefinition.Setting;
            this.Type = sysConfigOptionDefinition.Type;
        }
    }

    public equals(object: SysConfigOptionDefinition): boolean {
        return object.Name === this.Name;
    }

}
