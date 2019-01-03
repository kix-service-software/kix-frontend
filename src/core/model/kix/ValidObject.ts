import { KIXObject } from "./KIXObject";
import { KIXObjectType } from "./KIXObjectType";

export class ValidObject extends KIXObject<ValidObject> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.VALID_OBJECT;

    public Name: string;

    public ID: number;

    public constructor(validObject?: ValidObject) {
        super();
        if (validObject) {
            this.ID = Number(validObject.ID);
            this.ObjectId = this.ID;
            this.Name = validObject.Name;
        }
    }

    public equals(object: ValidObject): boolean {
        return object.ID === this.ID;
    }

}
