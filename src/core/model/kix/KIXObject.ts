import { KIXObjectType } from ".";
import { Link } from "./link";
import { ConfiguredPermissions } from "./permission";

export abstract class KIXObject<T = any> {

    public abstract ObjectId: string | number;

    public abstract KIXObjectType: KIXObjectType;

    public ConfiguredPermissions: ConfiguredPermissions;

    public Links: Link[];

    public LinkTypeName: string;

    public constructor(object?: KIXObject) {
        if (object) {
            this.ConfiguredPermissions = object.ConfiguredPermissions;
        }
    }

    public abstract equals(object: T): boolean;

    public getIdPropertyName(): string {
        return 'ID';
    }

}
