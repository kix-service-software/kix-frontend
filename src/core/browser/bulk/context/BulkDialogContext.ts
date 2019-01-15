import { Context } from "../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType, KIXObject } from "../../../model";
import { BulkDialogContextConfiguration } from "./BulkDialogContextConfiguration";

export class BulkDialogContext extends Context<BulkDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'bulk-dialog-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
