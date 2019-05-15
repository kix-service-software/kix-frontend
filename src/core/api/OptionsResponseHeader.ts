import { RequestMethod } from "./RequestMethod";
import { CRUD } from "../model";
import { ResponseHeader } from "./ResponseHeader";

export class OptionsResponseHeader {

    public Allow: RequestMethod[] = [];

    public AllowPermissionValue: CRUD = 0;

    public constructor(headers: Headers) {
        if (headers[ResponseHeader.ALLOW]) {
            this.Allow = headers[ResponseHeader.ALLOW].split(',');

            this.Allow.forEach((m) => {
                let value = 0;
                const method = m.trim();
                if (method === RequestMethod.POST) {
                    value = CRUD.CREATE;
                } else if (method === RequestMethod.GET) {
                    value = CRUD.READ;
                } else if (method === RequestMethod.PATCH) {
                    value = CRUD.UPDATE;
                } else if (method === RequestMethod.DELETE) {
                    value = CRUD.DELETE;
                }

                this.AllowPermissionValue = this.AllowPermissionValue | value;
            });
        }
    }

}
