import { OptionsResponseHeader } from "./OptionsResponseHeader";

export class OptionsResponse {

    public headers: OptionsResponseHeader;

    public constructor(response: Response) {
        this.headers = new OptionsResponseHeader(response.headers);
    }
}
