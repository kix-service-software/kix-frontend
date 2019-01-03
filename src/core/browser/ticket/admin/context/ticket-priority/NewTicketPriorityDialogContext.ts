import { Context } from "../../../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType, ContextDescriptor } from "../../../../../model";
import { NewTicketPriorityDialogContextConfiguration } from "./NewTicketPriorityDialogContextConfiguration";

export class NewTicketPriorityDialogContext extends Context<NewTicketPriorityDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'new-ticket-priority-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: NewTicketPriorityDialogContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }


    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }
}
