import { TicketCreationSocketListener } from './../socket/TicketCreationSocketListener';

export class TicketCreationReduxState {

    public customer: string = null;
    public customerId: string = null;
    public description: string = null;
    public dynamicFields: any[] = [];
    public pendingTime: number = null;
    public priorityId: number = null;
    public queueId: number = null;
    public stateId: number = null;
    public subject: string = null;
    public ticketTemplates: any[] = [];
    public typeId: number = null;
    public ownerId: number = null;
    public responsibleId: number = null;
    public serviceId: number = null;
    public slaId: number = null;

    // process triggers
    public createTicketInProcess: boolean = false;
    public resetTicketCreationInProcess: boolean = false;
    public loadTicketTemplates: boolean = false;

    public socketListener: TicketCreationSocketListener;

}
