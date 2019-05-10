import { CRUD } from "./kix";

export class UIComponentPermission {

    public constructor(
        public target: string,
        public value: CRUD
    ) { }

}
