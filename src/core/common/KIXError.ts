export class KIXError implements Error {

    public error: any;

    public name: string;

    public message: string;

    public constructor(error: any) {
        this.error = error;
    }
}
