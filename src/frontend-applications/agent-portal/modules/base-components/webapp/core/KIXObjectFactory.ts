/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from "./IKIXObjectFactory";
import { KIXObject } from "../../../../model/kix/KIXObject";
import { Permission } from "../../../user/model/Permission";

export abstract class KIXObjectFactory<T extends KIXObject> implements IKIXObjectFactory<T> {

    public abstract create(object: T): Promise<T>;

    protected constructor() { }

    public cleanupProperties(target: T, source: T): T {
        const propertiesToDelete: string[] = [];
        for (const property in target) {
            if (!source.hasOwnProperty(property)) {
                propertiesToDelete.push(property);
            }
        }

        propertiesToDelete.forEach((p) => delete target[p]);

        return target;
    }

    public createPermissions(object: T): void {
        if (object.ConfiguredPermissions && !Array.isArray(object.ConfiguredPermissions)) {
            if (object.ConfiguredPermissions.Assigned) {
                object.ConfiguredPermissions.Assigned = object.ConfiguredPermissions.Assigned.map(
                    (p) => new Permission(p)
                );
            }

            if (object.ConfiguredPermissions.DependingObjects) {
                object.ConfiguredPermissions.DependingObjects = object.ConfiguredPermissions.DependingObjects.map(
                    (p) => new Permission(p)
                );
            }
        }
    }
}
