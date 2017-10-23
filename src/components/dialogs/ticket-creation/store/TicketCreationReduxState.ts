import { DynamicField } from '@kix/core/dist/model/client';
export class TicketCreationReduxState {

    public customer: string = null;
    public customerId: string = null;
    public description: string = null;
    public dynamicFields: DynamicField[] = [];
    public pendingTime: number = null;
    public priorityId: number = null;
    public queueId: number = null;
    public stateId: number = null;
    public subject: string = null;
    public typeId: number = null;
    public ownerId: number = null;
    public responsibleId: number = null;
    public serviceId: number = null;
    public slaId: number = null;

}
