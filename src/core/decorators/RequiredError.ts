import { KIXError } from "../common";

export class RequiredError extends KIXError {
    public constructor(error: any) {
        super(error);
    }
}
