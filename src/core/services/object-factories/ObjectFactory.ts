/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IObjectFactory } from "./IObjectFactory";
import { KIXObject, KIXObjectType, CRUD } from "../../model";
import { PermissionService } from "../../../services/PermissionService";
import { UIComponentPermission } from "../../model/UIComponentPermission";

export abstract class ObjectFactory<T extends KIXObject = any> implements IObjectFactory<T> {

    public abstract isFactoryFor(objectType: KIXObjectType): boolean;

    public abstract create(object?: T, token?: string): Promise<T>;

    public async applyPermissions(token: string, object: T): Promise<T> {
        return object;
    }

    protected async readAccessDenied(token: string, resource: string): Promise<boolean> {
        const allowed = await PermissionService.getInstance().checkPermissions(
            token, [new UIComponentPermission(resource, [CRUD.READ])]
        );
        return !allowed;
    }

}
