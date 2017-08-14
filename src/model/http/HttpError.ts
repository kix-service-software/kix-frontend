export class HttpError {

    public status: number;

    public error: any;

    public constructor(status: number, error: string) {
        this.status = status;
        this.error = error;
    }

}
