import { Error } from "../model";

export class RequiredError extends Error {
    public constructor(error: any) {
        super('', error);
    }
}
