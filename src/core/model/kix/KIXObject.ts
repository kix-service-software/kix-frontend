import { KIXObjectType } from ".";
import { Link } from "./link";
import { Permissions, Permission } from "./permission";

export abstract class KIXObject<T = any> {

    public abstract ObjectId: string | number;

    public abstract KIXObjectType: KIXObjectType;

    public Permissions: Permissions | Permission[];

    public Links: Link[];

    public LinkTypeName: string;

    public constructor(object?: KIXObject) {
        if (object) {
            this.Permissions = object.Permissions;
        }
    }

    public abstract equals(object: T): boolean;

    public getIdPropertyName(): string {
        return 'ID';
    }

}
