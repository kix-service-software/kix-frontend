export class TicketCreationReduxState {

    public createTicketInProcess: boolean = false;
    public resetTicketCreationInProcess: boolean = false;

    public customer: number = null;
    public customerId: number = null;
    public description: string = null;
    public dynamicFields: any[] = [];
    public pendingTime: string = null;
    public priorityId: number = null;
    public queueId: number = null;
    public stateId: number = null;
    public subject: string = null;
    public ticketTemplates: any[] = [];
    public typeId: number = null;
    public ownerId: number = null;
    public responsibleId: number = null;

    // process triggers
    public loadTicketTemplates: boolean = false;

}
