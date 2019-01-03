import { Context } from "../../../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType, ContextDescriptor } from "../../../../../model";
import { EditTicketTypeDialogContextConfiguration } from "./EditTicketTypeDialogContextConfiguration";

export class EditTicketTypeDialogContext extends Context<EditTicketTypeDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'edit-ticket-type-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: EditTicketTypeDialogContextConfiguration = null
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
