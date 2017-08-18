import { KIXError } from './../KIXError';

export class UserServiceError extends KIXError {

    public constructor(error: any) {
        super(error);
    }

}
