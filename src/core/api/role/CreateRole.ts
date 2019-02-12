import { RequestObject } from '../RequestObject';

export class CreateRole extends RequestObject {

    public constructor(name: string, comment: string = null, validId: number = 1) {
        super();
        this.applyProperty("Name", name);
        this.applyProperty("Comment", comment);
        this.applyProperty("ValidID", validId);
    }

}
