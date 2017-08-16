import { KIXError } from './../KIXError';

export class HttpError extends KIXError {

    public status: number;

    public constructor(status: number, error: string) {
        super(error);
        this.status = status;
    }

}
