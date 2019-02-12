import { Context } from "../../../model/components/context/Context";
import { ContextService } from "../../context";
import { ConfiguredWidget, WidgetConfiguration, WidgetType } from "../../../model";
import { NewCustomerDialogContextConfiguration } from "./NewCustomerDialogContextConfiguration";

export class NewCustomerDialogContext extends Context<NewCustomerDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'new-customer-dialog-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
