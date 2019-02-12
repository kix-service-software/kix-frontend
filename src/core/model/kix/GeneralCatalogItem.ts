import { KIXObject } from "./KIXObject";
import { KIXObjectType } from "./KIXObjectType";

export class GeneralCatalogItem extends KIXObject<GeneralCatalogItem> {
    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.GENERAL_CATALOG_ITEM;

    public ItemID: number;

    public Name: string;

    public Class: string;

    public Comment: string;

    public ValidID: number;

    public CreateBy: number;

    public CreateTime: string;

    public ChangeBy: number;

    public ChangeTime: string;

    public constructor(item?: GeneralCatalogItem) {
        super();
        if (item) {
            this.ItemID = Number(item.ItemID);
            this.ObjectId = this.ItemID;
            this.Name = item.Name;
            this.Class = item.Class;
            this.Comment = item.Comment;
            this.ValidID = item.ValidID;
            this.CreateBy = item.CreateBy;
            this.CreateTime = item.CreateTime;
            this.ChangeBy = item.ChangeBy;
            this.ChangeTime = item.ChangeTime;
        }
    }

    public equals(object: GeneralCatalogItem): boolean {
        return object.ItemID === this.ItemID;
    }

    public getIdPropertyName(): string {
        return 'ItemID';
    }

}
