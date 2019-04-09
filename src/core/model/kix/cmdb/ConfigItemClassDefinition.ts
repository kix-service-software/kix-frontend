import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { AttributeDefinition } from "./AttributeDefinition";

export class ConfigItemClassDefinition extends KIXObject<ConfigItemClassDefinition> {

    public KIXObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION;

    public ObjectId: string | number;

    public ClassID: number;

    public Version: number;

    public CreateBy: number;

    public CreateTime: string;

    public Definition: AttributeDefinition[];

    public Class: string;

    public DefinitionID: number;

    public DefinitionString: string;

    public isCurrentDefinition: boolean;

    public constructor(configItemClassDefintion: ConfigItemClassDefinition) {
        super();
        if (configItemClassDefintion) {
            this.DefinitionID = configItemClassDefintion.DefinitionID;
            this.ObjectId = this.DefinitionID;
            this.Class = configItemClassDefintion.Class;
            this.ClassID = configItemClassDefintion.ClassID;
            this.Version = configItemClassDefintion.Version;
            this.CreateBy = configItemClassDefintion.CreateBy;
            this.CreateTime = configItemClassDefintion.CreateTime;
            this.Definition = configItemClassDefintion.Definition;
            this.DefinitionString = configItemClassDefintion.DefinitionString;
            this.isCurrentDefinition = configItemClassDefintion.isCurrentDefinition;
        }
    }

    public equals(configItemClassDefintion: ConfigItemClassDefinition): boolean {
        return this.DefinitionID === configItemClassDefintion.DefinitionID;
    }

    public getIdPropertyName(): string {
        return 'DefinitionID';
    }

}
