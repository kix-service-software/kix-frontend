import {
    FormInstance,
    FormContext,
    KIXObjectType,
    IFormInstance,
    SearchFormInstance,
    SearchForm
} from "../../model";
import { ContextService } from "../context";
import { FormValidationService, RequiredFormFieldValidator } from ".";
import { FormFactory } from "./FormFactory";
import { MaxLengthFormFieldValidator, RegExFormFieldValidator } from "./validators";

export class FormService {

    private static INSTANCE: FormService;

    public static getInstance(): FormService {
        if (!FormService.INSTANCE) {
            FormService.INSTANCE = new FormService();
        }
        return FormService.INSTANCE;
    }

    private formInstances: Map<string, IFormInstance> = new Map();

    private constructor() {
        this.initValidators();
    }

    private initValidators(): void {
        FormValidationService.getInstance().registerValidator(new RequiredFormFieldValidator());
        FormValidationService.getInstance().registerValidator(new MaxLengthFormFieldValidator());
        FormValidationService.getInstance().registerValidator(new RegExFormFieldValidator());
    }

    public async getFormInstance<T extends IFormInstance>(formId: string, cache: boolean = true): Promise<T> {
        let formInstance;
        if (formId) {
            if (this.formInstances.has(formId) && cache) {
                formInstance = this.formInstances.get(formId);
            } else {
                this.deleteFormInstance(formId);
                const objectData = ContextService.getInstance().getObjectData();
                if (objectData && objectData.forms) {
                    const configuredForm = objectData.forms.find((f) => f.id === formId);
                    const form = { ...configuredForm };
                    FormFactory.initForm(form);
                    if (form.formContext === FormContext.SEARCH) {
                        formInstance = new SearchFormInstance((form as SearchForm));
                    } else {
                        formInstance = new FormInstance(form);
                        await formInstance.initFormInstance();
                    }

                    this.formInstances.set(formId, formInstance);
                }
            }
        }
        return formInstance;
    }

    public deleteFormInstance(formId: string): void {
        if (this.formInstances.has(formId)) {
            this.formInstances.delete(formId);
        }
    }

    public getFormIdByContext(formContext: FormContext, formObject: KIXObjectType): string {
        let formId;
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData && objectData.formIDsWithContext) {
            const formIdByContext = objectData.formIDsWithContext.find(
                (fidwc) => fidwc[0] === formContext && fidwc[1] === formObject
            );
            if (formIdByContext && formIdByContext[2]) {
                formId = formIdByContext[2];
            }
        }
        return formId;
    }

}
