import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class ConfigItemImage extends KIXObject<ConfigItemImage> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_IMAGE;

    public ID: string;

    public ConfigItemID: number;

    public Filename: string;

    public ContentType: string;

    public Content: string;

    public Comment: string = '';

    public constructor(image?: ConfigItemImage) {
        super();
        if (image) {
            this.ID = image.ID;
            this.ObjectId = this.ID;
            this.ConfigItemID = Number(image.ConfigItemID);
            this.Filename = image.Filename;
            this.Content = image.Content;
            this.ContentType = image.ContentType;
            this.Comment = image.Comment || '';
        }
    }

    public equals(image: ConfigItemImage): boolean {
        return this.ID === image.ID && this.ConfigItemID === image.ConfigItemID;
    }

}
