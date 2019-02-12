import { CreateRole } from "./CreateRole";

export class CreateRoleRequest {

    public Role: CreateRole;

    public constructor(createRole: CreateRole) {
        this.Role = createRole;
    }

}
