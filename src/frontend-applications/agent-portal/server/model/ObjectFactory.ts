/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { UIComponentPermission } from "../../model/UIComponentPermission";
import { KIXObject } from "../../model/kix/KIXObject";
import { IObjectFactory } from "./IObjectFactory";
import { KIXObjectType } from "../../model/kix/KIXObjectType";
import { CRUD } from "../../../../server/model/rest/CRUD";

export abstract class ObjectFactory<T extends KIXObject = any> implements IObjectFactory<T> {

    public abstract isFactoryFor(objectType: KIXObjectType | string): boolean;

    public abstract create(object?: T, token?: string): Promise<T>;

    public async applyPermissions(token: string, object: T): Promise<T> {
        return object;
    }

}
