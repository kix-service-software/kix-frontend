import { RequestObject } from '../RequestObject';

export class CreateService extends RequestObject {

    public constructor(name: string, typeId: number, comment?: string, criticality?: string, validId?: number) {
        super();
        this.applyProperty("Name", name);
        this.applyProperty("TypeID", typeId);
        this.applyProperty("Comment", comment);
        this.applyProperty("Criticality", criticality);
        this.applyProperty("ValidID", validId);
    }

}
