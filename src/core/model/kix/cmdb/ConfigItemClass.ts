import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { ConfigItemClassDefinition } from "./ConfigItemClassDefinition";
import { ConfigItemStats } from "./ConfigItemStats";
import { AttributeDefinition } from "./AttributeDefinition";

export class ConfigItemClass extends KIXObject<ConfigItemClass> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS;

    public ID: number;

    public Name: string;

    public ValidID: number;

    public Comment: string;

    public ChangeTime: string;

    public ChangeBy: number;

    public CreateTime: string;

    public CreateBy: number;

    public Definitions: ConfigItemClassDefinition[];

    public CurrentDefinition: ConfigItemClassDefinition;

    public ConfigItemStats: ConfigItemStats;

    public constructor(configItemClass?: ConfigItemClass) {
        super(configItemClass);
        if (configItemClass) {
            this.ID = configItemClass.ID;
            this.ObjectId = this.ID;
            this.Name = configItemClass.Name;
            this.ValidID = configItemClass.ValidID;
            this.Comment = configItemClass.Comment;
            this.ChangeTime = configItemClass.ChangeTime;
            this.ChangeBy = configItemClass.ChangeBy;
            this.CreateTime = configItemClass.CreateTime;
            this.CreateBy = configItemClass.CreateBy;
            this.CurrentDefinition = configItemClass.CurrentDefinition;

            this.Definitions = configItemClass.Definitions
                ? configItemClass.Definitions.map((d) => new ConfigItemClassDefinition(d))
                : [];

            this.ConfigItemStats = configItemClass.ConfigItemStats;

            if (this.CurrentDefinition && this.CurrentDefinition.Definition) {
                this.CurrentDefinition.Definition = this.CurrentDefinition.Definition.map(
                    (d) => new AttributeDefinition(d)
                );

                const currentDefinition = this.Definitions.find(
                    (v) => v.DefinitionID === this.CurrentDefinition.DefinitionID
                );

                if (currentDefinition) {
                    currentDefinition.isCurrentDefinition = true;
                }
            }
        }
    }

    public equals(configItemClass: ConfigItemClass): boolean {
        return this.ID === configItemClass.ID;
    }

}
