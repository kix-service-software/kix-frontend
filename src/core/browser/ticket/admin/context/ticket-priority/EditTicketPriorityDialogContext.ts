import { Context } from "../../../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType, ContextDescriptor } from "../../../../../model";
import { EditTicketPriorityDialogContextConfiguration } from "./EditTicketPriorityDialogContextConfiguration";

export class EditTicketPriorityDialogContext extends Context<EditTicketPriorityDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'edit-ticket-priority-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: EditTicketPriorityDialogContextConfiguration = null
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
