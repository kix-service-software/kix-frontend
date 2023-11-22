/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class TicketType extends KIXObject {

  public KIXObjectType: KIXObjectType = KIXObjectType.TICKET_TYPE;

  public ObjectId: number;

  public ID: number;

  public CreateBy: number;

  public Name: string;

  public TypeName: string;

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

  public toString(): string {
    return this.Name;
  }

}
