import { RequestObject } from '../RequestObject';

export class CreateGroup extends RequestObject {

    public constructor(name: string, comment: string, validId: number) {
        super();

        this.applyProperty('Name', name);
        this.applyProperty('Comment', comment);
        this.applyProperty('ValidID', validId);
    }

}
