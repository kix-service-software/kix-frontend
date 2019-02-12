import { RequestObject } from '../../RequestObject';

export class CreateWatcher extends RequestObject {

    public constructor(userId: number) {
        super();
        this.applyProperty("UserID", userId);
    }
}
