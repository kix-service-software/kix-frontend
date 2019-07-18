/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from ".";
import { Link } from "./link";
import { ConfiguredPermissions } from "./permission";

export abstract class KIXObject<T = any> {

    public abstract ObjectId: string | number;

    public abstract KIXObjectType: KIXObjectType;

    public ConfiguredPermissions: ConfiguredPermissions;

    public Links: Link[];

    public LinkTypeName: string;

    public ChangeBy: number;

    public ChangeTime: string;

    public CreateBy: number;

    public CreateTime: string;

    public ValidID: number;

    public Comment: string;

    public constructor(object?: KIXObject) {
        if (object) {
            this.ConfiguredPermissions = object.ConfiguredPermissions;
            this.CreateBy = object.CreateBy;
            this.ChangeBy = object.ChangeBy;
            this.CreateTime = object.CreateTime;
            this.ChangeTime = object.ChangeTime;
            this.ValidID = object.ValidID;
            this.Comment = object.Comment;
        }
    }

    public equals(object: KIXObject): boolean {
        return this.ObjectId === object.ObjectId;
    }

    public getIdPropertyName(): string {
        return 'ID';
    }

}
