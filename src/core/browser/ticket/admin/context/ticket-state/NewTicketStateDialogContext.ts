import { Context } from "../../../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType, ContextDescriptor } from "../../../../../model";
import { NewTicketStateDialogContextConfiguration } from "./NewTicketStateDialogContextConfiguration";

export class NewTicketStateDialogContext extends Context<NewTicketStateDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'new-ticket-state-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: NewTicketStateDialogContextConfiguration = null
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
