import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class DynamicField extends KIXObject<DynamicField> {

    public KIXObjectType: KIXObjectType = KIXObjectType.DYNAMIC_FIELD;

    public ObjectId: string | number;

    public ID: number;

    public Name: string;

    public DisplayGroupID: number;

    public Label: string;

    public FieldType: string;

    public ObjectType: string;

    public InternalField: number;

    public CreateBy: number;

    public CreateTime: string;

    public ChangeBy: number;

    public ChangeTime: string;

    public ValidID: number;

    public Config: any;

    public Value: string;

    public DisplayValue: string;

    public constructor(dynamicField?: DynamicField) {
        super();
        if (dynamicField) {
            this.ID = Number(dynamicField.ID);
            this.ObjectId = this.ID;
            this.Name = dynamicField.Name;
            this.DisplayGroupID = Number(dynamicField.DisplayGroupID);
            this.Label = dynamicField.Label;
            this.FieldType = dynamicField.FieldType;
            this.ObjectType = dynamicField.ObjectType;
            this.InternalField = dynamicField.InternalField;
            this.CreateBy = dynamicField.CreateBy;
            this.CreateTime = dynamicField.CreateTime;
            this.ChangeBy = dynamicField.ChangeBy;
            this.ChangeTime = dynamicField.ChangeTime;
            this.ValidID = dynamicField.ValidID;
            this.Config = dynamicField.Config;
            this.Value = dynamicField.Value;
            this.DisplayValue = dynamicField.DisplayValue;
        }
    }

    public equals(object: DynamicField): boolean {
        return object.ID === this.ID;
    }

}
