import { KIXError } from './../KIXError';

export class HttpError extends KIXError {

    public status: number;
    public errorMessage: string;

    public constructor(status: number, errorMessage: string, errorObject?: any) {
        super(errorObject);
        this.status = status;
        this.errorMessage = errorMessage;
    }

}
