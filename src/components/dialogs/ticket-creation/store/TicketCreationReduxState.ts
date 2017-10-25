import { DynamicField } from '@kix/core/dist/model/client';
export class TicketCreationReduxState {

    public customer: string = 'test@kixng.com';
    public customerId: string = 'KIXng';
    public description: string = '';
    public dynamicFields: DynamicField[] = [];
    public pendingTime: number = null;
    public priorityId: number = null;
    public queueId: number = 1;
    public stateId: number = null;
    public subject: string = null;
    public typeId: number = null;
    public ownerId: number = null;
    public responsibleId: number = null;
    public serviceId: number = null;
    public slaId: number = null;

}
