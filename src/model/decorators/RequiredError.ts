import { KIXError } from "../";

export class RequiredError extends KIXError {
    public constructor(error: any) {
        super(error);
    }
}
