/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../../base-components/webapp/core/table/TableContentProvider";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ITable, IRowObject, TableValue, RowObject } from "../../../base-components/webapp/core/table";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { KIXObject } from "../../../../model/kix/KIXObject";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { Role } from "../../model/Role";
import { Permission } from "../../model/Permission";

export class PermissionsTableContentProvider extends TableContentProvider<Permission> {

    public constructor(
        public objectType: KIXObjectType | string,
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string,
    ) {
        super(KIXObjectType.PERMISSION, table, objectIds, loadingOptions, contextId);
    }
    public async loadData(): Promise<Array<IRowObject<Permission>>> {
        let object: KIXObject;
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            object = await context.getObject();
        }

        let rowObjects = [];
        if (object && object.ConfiguredPermissions) {
            let permissions = [];

            if (this.objectType === KIXObjectType.ROLE_PERMISSION) {
                permissions = (object as Role).Permissions;
            } else {
                permissions = this.objectType === KIXObjectType.PERMISSION_DEPENDING_OBJECTS
                    ? object.ConfiguredPermissions.DependingObjects
                    : object.ConfiguredPermissions.Assigned;
            }

            rowObjects = permissions.map((p) => {
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

    protected getContextObjectType(): KIXObjectType | string {
        return KIXObjectType.ROLE;
    }

}
