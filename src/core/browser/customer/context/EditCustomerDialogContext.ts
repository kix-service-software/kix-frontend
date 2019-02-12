import { Context } from "../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType } from "../../../model";
import { EditCustomerDialogContextConfiguration } from "./EditCustomerDialogContextConfiguration";

export class EditCustomerDialogContext extends Context<EditCustomerDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'edit-customer-dialog-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
