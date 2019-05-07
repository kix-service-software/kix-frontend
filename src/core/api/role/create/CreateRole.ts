import { RequestObject } from '../../RequestObject';
import { RoleProperty, PermissionProperty, CreatePermissionDescription } from '../../../model';

export class CreateRole extends RequestObject {

    public constructor(parameter: Array<[string, any]>) {
        super(parameter.filter((p) => p[0] !== RoleProperty.PERMISSIONS));

        const permissionParameter = parameter.find((p) => p[0] === RoleProperty.PERMISSIONS);
        if (permissionParameter) {
            permissionParameter[1].forEach((pd: CreatePermissionDescription) => {
                delete (pd.ID);
                delete (pd.RoleID);
            });
        }
    }

}
