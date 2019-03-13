import { Context } from "../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType } from "../../../model";
import { CustomerImportDialogContextConfiguration } from "./CustomerImportDialogContextConfiguration";

export class CustomerImportDialogContext extends Context<CustomerImportDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'customer-import-dialog-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
