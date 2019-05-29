import { Error } from "./Error";

export class PermissionError extends Error {

    public constructor(
        error: Error,
        public resource: string,
        public method: string
    ) {
        super(error.Code, error.Message, error.StatusCode);
    }

}
