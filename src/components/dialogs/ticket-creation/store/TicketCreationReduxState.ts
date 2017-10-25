import { DynamicField } from '@kix/core/dist/model/client';
export class TicketCreationReduxState {

    public customer: string = 'test@kixng.com';
    public customerId: string = 'KIXng';
    public description: string = '';
    public dynamicFields: DynamicField[] = [];
    public pendingTime: number = null;
    public priorityId: number = 0;
    public queueId: number = 1;
    public stateId: number = 0;
    public subject: string = null;
    public typeId: number = 0;
    public ownerId: number = 1;
    public responsibleId: number = 1;
    public serviceId: number = null;
    public slaId: number = null;

}
