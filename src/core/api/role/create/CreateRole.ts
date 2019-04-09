import { RequestObject } from '../../RequestObject';
import { RoleProperty, PermissionProperty, CreatePermissionDescription } from '../../../model';

export class CreateRole extends RequestObject {

    public constructor(parameter: Array<[string, any]>) {
        super();
        parameter.forEach((p) => {
            if (p[0] === RoleProperty.PERMISSIONS) {
                p[1].forEach((pd: CreatePermissionDescription) => {
                    delete (pd.ID);
                    delete (pd.RoleID);
                });
            }
            this.applyProperty(p[0], p[1]);
        });
    }

}
