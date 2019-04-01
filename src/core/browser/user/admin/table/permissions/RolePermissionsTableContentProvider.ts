import { TableContentProvider } from "../../../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, Role, Permission } from "../../../../../model";
import { ITable, IRowObject, TableValue, RowObject } from "../../../../table";
import { ContextService } from "../../../../context";

export class RolePermissionsTableContentProvider extends TableContentProvider<Permission> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.ROLE_PERMISSION, table, objectIds, loadingOptions, contextId);
    }
    public async loadData(): Promise<Array<IRowObject<Permission>>> {
        let role: Role;
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            role = await context.getObject<Role>();
        }

        const rowObjects = role.Permissions.map((p) => {
            const values: TableValue[] = [];

            for (const property in p) {
                if (p.hasOwnProperty(property)) {
                    values.push(new TableValue(property, p[property]));
                }
            }

            return new RowObject<Permission>(values, p);
        });

        return rowObjects;
    }
}
