import { Permission, KIXObjectLoadingOptions, KIXObjectType } from "../../../../model";
import { TableContentProvider } from "../../../table/TableContentProvider";
import { ITable, IRowObject, TableValue, RowObject } from "../../../table";
import { ContextService } from "../../../context";

export class PermissionsTableContentProvider extends TableContentProvider<Permission> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.PERMISSION, table, objectIds, loadingOptions, contextId);
    }
    public async loadData(): Promise<Array<IRowObject<Permission>>> {
        let object;
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            object = await context.getObject();
        }

        let rowObjects = [];
        if (object && object.Permissions) {
            rowObjects = object.Permissions.map((p) => {
                const values: TableValue[] = [];

                for (const property in p) {
                    if (p.hasOwnProperty(property)) {
                        values.push(new TableValue(property, p[property]));
                    }
                }

                return new RowObject<Permission>(values, p);
            });
        }

        return rowObjects;
    }
}
