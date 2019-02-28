import { Context } from "../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType } from "../../../model";
import { ImportDialogContextConfiguration } from "./ImportDialogContextConfiguration";

export class ImportDialogContext extends Context<ImportDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'import-dialog-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
