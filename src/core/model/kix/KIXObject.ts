import { KIXObjectType } from ".";
import { Link } from "./link";
import { Permission } from "./permission";

export abstract class KIXObject<T = any> {

    public abstract ObjectId: string | number;

    public abstract KIXObjectType: KIXObjectType;

    public Permissions: Permission[];

    public Links: Link[];

    public LinkTypeName: string;

    public abstract equals(object: T): boolean;

    public getIdPropertyName(): string {
        return 'ID';
    }

}
