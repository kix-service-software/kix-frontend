import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class LinkType extends KIXObject<LinkType> {

    public KIXObjectType: KIXObjectType = KIXObjectType.LINK_TYPE;

    public ObjectId: string | number;

    public TypeID: number;

    public Name: string;

    public Source: string;

    public SourceName: string;

    public Target: string;

    public TargetName: string;

    public Pointed: number;

    public constructor(linkType?: LinkType) {
        super();
        if (linkType) {
            this.TypeID = linkType.TypeID;
            this.ObjectId = this.TypeID;
            this.Name = linkType.Name;
            this.Source = linkType.Source;
            this.SourceName = linkType.SourceName;
            this.Target = linkType.Target;
            this.TargetName = linkType.TargetName;
            this.Pointed = linkType.Pointed;
        }
    }

    public equals(linkType: LinkType): boolean {
        return this.TypeID === linkType.TypeID;
    }

    public getIdPropertyName(): string {
        return 'TypeID';
    }
}
