import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class TicketType extends KIXObject<TicketType> {

  public KIXObjectType: KIXObjectType = KIXObjectType.TICKET_TYPE;

  public ObjectId: number;

  public ID: number;

  public CreateBy: number;

  public Name: string;

  public Comment: string;

  public ValidID: number;

  public CreateTime: string;

  public ChangeTime: string;

  public ChangeBy: number;

  public constructor(type?: TicketType) {
    super();
    if (type) {
      this.ID = Number(type.ID);
      this.ObjectId = this.ID;
      this.CreateBy = type.CreateBy;
      this.CreateTime = type.CreateTime;
      this.ChangeBy = type.ChangeBy;
      this.ChangeTime = type.ChangeTime;
      this.Name = type.Name;
      this.Comment = type.Comment;
      this.ValidID = type.ValidID;
    }
  }

  public equals(type: TicketType): boolean {
    return this.ID === type.ID;
  }

}
