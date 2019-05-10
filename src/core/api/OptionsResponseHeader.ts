import { RequestMethod } from "./RequestMethod";
import { CRUD } from "../model";
import { ValueState } from "../browser";

export class OptionsResponseHeader {

    public Allow: RequestMethod[] = [];

    public AllowPermission: CRUD = 0;

    public constructor(headers: any) {
        if (headers['Allow']) {
            this.Allow = headers['Allow'].split(',');

            this.Allow.forEach((m) => {
                let value = 0;
                if (m === RequestMethod.POST) {
                    value = CRUD.CREATE;
                } else if (m === RequestMethod.GET) {
                    value = CRUD.READ;
                } else if (m === RequestMethod.PATCH) {
                    value = CRUD.UPDATE;
                } else if (m === RequestMethod.DELETE) {
                    value = CRUD.DELETE;
                }

                this.AllowPermission = this.AllowPermission || value;
            });
        }
    }

}
