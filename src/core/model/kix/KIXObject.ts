import { KIXObjectType } from ".";
import { Link } from "./link";

export abstract class KIXObject<T = any> {

    public abstract ObjectId: string | number;

    public abstract KIXObjectType: KIXObjectType;

    // TODO: ggf. wieder entfernen, aber notwendig für edit-linked-objects-dialog
    public Links: Link[] = [];

    public LinkTypeName: string;

    public abstract equals(object: T): boolean;

    public getIdPropertyName(): string {
        return 'ID';
    }

}
