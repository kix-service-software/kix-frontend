import { RequestObject } from '../RequestObject';

export class UpdateService extends RequestObject {

    public constructor(
        name?: string, comment?: string, typeId?: number, parentId?: number, criticality?: string, validId?: number
    ) {
        super();
        this.applyProperty("Name", name);
        this.applyProperty("Comment", comment);
        this.applyProperty("TypeID", typeId);
        this.applyProperty("ParentID", parentId);
        this.applyProperty("Criticality", criticality);
        this.applyProperty("ValidID", validId);

    }

}
