import { Context } from "../../../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType, ContextDescriptor } from "../../../../../model";
import { EditTicketStateDialogContextConfiguration } from "./EditTicketStateDialogContextConfiguration";

export class EditTicketStateDialogContext extends Context<EditTicketStateDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'edit-ticket-state-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: EditTicketStateDialogContextConfiguration = null
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
