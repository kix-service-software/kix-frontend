import { RequestObject } from '../RequestObject';

export class UpdateDynamicField extends RequestObject {

    public DynamicField: any;

    public constructor(
        name: string = null, label: string = null, fieldType: string = null,
        objectType: string = null, validId: number = null, config: any = null
    ) {
        super();

        this.applyProperty('Name', name);
        this.applyProperty('Label', label);
        this.applyProperty('FieldType', fieldType);
        this.applyProperty('ObjectType', objectType);
        this.applyProperty('ValidID', validId);
        this.applyProperty('Config', config);
    }

}
