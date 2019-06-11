import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType, TextModule, Form, FormFieldValue, TextModuleProperty } from "../../model";
import { ContextService } from "../context";
import { EditTextModuleDialogContext } from "./context";
import { KIXObjectService } from "../kix";

export class TextModuleFormService extends KIXObjectFormService<TextModule> {

    private static INSTANCE: TextModuleFormService = null;

    public static getInstance(): TextModuleFormService {
        if (!TextModuleFormService.INSTANCE) {
            TextModuleFormService.INSTANCE = new TextModuleFormService();
        }

        return TextModuleFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TEXT_MODULE;
    }

    public async initValues(form: Form): Promise<Map<string, FormFieldValue<any>>> {
        const context = await ContextService.getInstance().getContext<EditTextModuleDialogContext>(
            EditTextModuleDialogContext.CONTEXT_ID
        );
        const textModuleId = context ? context.getObjectId() : null;
        const textModules = textModuleId
            ? await KIXObjectService.loadObjects<TextModule>(KIXObjectType.TEXT_MODULE, [textModuleId]) : null;
        return await super.initValues(form, textModules ? textModules[0] : null);
    }

    protected async getValue(property: string, value: any, textModule: TextModule): Promise<any> {
        switch (property) {
            case TextModuleProperty.KEYWORDS:
                if (value && Array.isArray(value)) {
                    value = value.join(',');
                } else {
                    value = value;
                }
                break;
            default:
        }
        return value;
    }

}
