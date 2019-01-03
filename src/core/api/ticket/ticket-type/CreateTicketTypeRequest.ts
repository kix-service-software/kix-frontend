import { CreateTicketType } from '../..';

export class CreateTicketTypeRequest {
  public TicketType: CreateTicketType;

  public constructor(createTicketType: CreateTicketType) {
    this.TicketType = createTicketType;
  }
}
