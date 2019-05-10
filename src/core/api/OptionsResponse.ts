import { OptionsResponseHeader } from "./OptionsResponseHeader";

export class OptionsResponse {

    public headers: OptionsResponseHeader;

    public constructor(response: any) {
        this.headers = new OptionsResponseHeader(response.headers);
    }
}
