import { CreateTicketType } from '../..';

export class CreateTranslationRequest {
  public TicketType: CreateTicketType;

  public constructor(createTicketType: CreateTicketType) {
    this.TicketType = createTicketType;
  }
}
