import { CRUD } from "./kix";

export class UIComponentPermission {

    public value: CRUD = 0;

    public constructor(
        public target: string,
        public permissions: CRUD[] = [],
        public OR: boolean = false
    ) {
        permissions.forEach((p) => this.value = this.value | p);
    }

}