import { RequestObject } from '../RequestObject';

export class UpdateGroup extends RequestObject {

    public constructor(name: string, comment: string, validId: number) {
        super();

        this.applyProperty("Name", name);
        this.applyProperty("Comment", name);
        this.applyProperty("ValidID", validId);
    }

}
