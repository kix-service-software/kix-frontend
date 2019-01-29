import { Context } from "../../../model/components/context/Context";
import {
    WidgetConfiguration, WidgetType, KIXObjectType, ContextDescriptor,
    IFormInstanceListener, FormField, FormFieldValue, FormContext
} from "../../../model";
import { EditConfigItemDialogContextConfiguration } from "./EditConfigItemDialogContextConfiguration";
import { FormService } from "../../form";

export class EditConfigItemDialogContext
    extends Context<EditConfigItemDialogContextConfiguration> implements IFormInstanceListener {

    public static CONTEXT_ID: string = 'edit-config-item-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: EditConfigItemDialogContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

    public async initContext(): Promise<void> {
        const formId = FormService.getInstance().getFormIdByContext(FormContext.EDIT, KIXObjectType.CONFIG_ITEM);
        this.formListenerId = 'EditConfigItemDialogContext';
        await FormService.getInstance().registerFormInstanceListener(formId, this);
    }

    public updateForm(): void {
        return;
    }

    public formValueChanged(formField: FormField, value: FormFieldValue<any>, oldValue: any): void {
        return;
    }

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }
}
