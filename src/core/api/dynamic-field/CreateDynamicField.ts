import { RequestObject } from '../RequestObject';

export class CreateDynamicField extends RequestObject {

    public constructor(
        name: string, label: string, fieldType: string, objectType: string,
        internalField: number = null, validID: number = null, config: any = null
    ) {
        super();
        this.applyProperty("Name", name);
        this.applyProperty("Label", label);
        this.applyProperty("FieldType", fieldType);
        this.applyProperty("ObjectType", objectType);
        this.applyProperty("InternalField", internalField);
        this.applyProperty("ValidID", validID);
        this.applyProperty("Config", config);
    }

}
