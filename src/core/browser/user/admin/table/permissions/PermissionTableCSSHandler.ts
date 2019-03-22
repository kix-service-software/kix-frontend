import { ITableCSSHandler, TableValue } from "../../../../table";
import { Permission, CRUD } from "../../../../../model";

export class PermissionTableCSSHandler implements ITableCSSHandler<Permission> {

    public getRowCSSClasses(permission: Permission): string[] {
        const classes = [];
        if (permission.Value & CRUD.DENY) {
            classes.push('error');
        }

        return classes;
    }

    public getValueCSSClasses(object: Permission, value: TableValue): string[] {
        return [];
    }


}
