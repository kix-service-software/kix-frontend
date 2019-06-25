import { RequestMethod, OptionsResponse, ResponseHeader } from "../../src/core/api";

export class HTTPUtil {

    public static createOptionsResponse(methods: RequestMethod[]): OptionsResponse {
        const headers = {};
        headers[ResponseHeader.ALLOW] = methods.join(',');
        const response = { headers };

        return new OptionsResponse(response as any);
    }

}
