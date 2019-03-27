import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";

export class CreatePermissionOptions extends KIXObjectSpecificCreateOptions {

    public constructor(
        public roleId: number
    ) {
        super();
    }

}
