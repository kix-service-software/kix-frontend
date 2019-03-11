import { RequestObject } from '../RequestObject';

export class UpdateRole extends RequestObject {

    public constructor(name: string, comment: string = null, validId: number = null) {
        super();

        this.applyProperty('Name', name);
        this.applyProperty('Comment', name);
        this.applyProperty('ValidID', validId);
    }

}
