import {
    FormInstance, FormContext, KIXObjectType, IFormInstance, SearchFormInstance, SearchForm, Form
} from "../../model";
import { FormValidationService, RequiredFormFieldValidator } from ".";
import { FormFactory } from "./FormFactory";
import { MaxLengthFormFieldValidator, RegExFormFieldValidator } from "./validators";
import { KIXModulesSocketListener } from "../modules/KIXModulesSocketListener";
import { BrowserUtil } from "../BrowserUtil";

export class FormService {

    private static INSTANCE: FormService;

    public static getInstance(): FormService {
        if (!FormService.INSTANCE) {
            FormService.INSTANCE = new FormService();
        }
        return FormService.INSTANCE;
    }

    private formInstances: Map<string, IFormInstance> = new Map();

    private forms: Form[] = [];
    private formIDsWithContext: Array<[FormContext, KIXObjectType, string]> = [];

    private constructor() {
        this.initValidators();
    }

    private initValidators(): void {
        FormValidationService.getInstance().registerValidator(new RequiredFormFieldValidator());
        FormValidationService.getInstance().registerValidator(new MaxLengthFormFieldValidator());
        FormValidationService.getInstance().registerValidator(new RegExFormFieldValidator());
    }

    public async loadFormConfigurations(): Promise<void> {
        const formConfigurations = await KIXModulesSocketListener.getInstance().loadFormConfigurations();
        this.forms = formConfigurations[0];
        this.formIDsWithContext = formConfigurations[1];
    }

    public async getFormInstance<T extends IFormInstance>(formId: string, cache: boolean = true): Promise<T> {
        let formInstance;
        if (formId) {
            if (this.formInstances.has(formId) && cache) {
                formInstance = this.formInstances.get(formId);
            } else {
                this.deleteFormInstance(formId);
                if (this.forms) {
                    const configuredForm = this.forms.find((f) => f.id === formId);
                    if (configuredForm) {
                        const form = { ...configuredForm };
                        FormFactory.initForm(form);
                        if (form.formContext === FormContext.SEARCH) {
                            formInstance = new SearchFormInstance((form as SearchForm));
                        } else {
                            formInstance = new FormInstance(form);
                            await formInstance.initFormInstance();
                        }

                        this.formInstances.set(formId, formInstance);
                    } else {
                        BrowserUtil.openErrorOverlay(`No form configuration found for id ${formId}`);
                    }
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
        if (this.formIDsWithContext) {
            const formIdByContext = this.formIDsWithContext.find(
                (fidwc) => fidwc[0] === formContext && fidwc[1] === formObject
            );
            if (formIdByContext && formIdByContext[2]) {
                formId = formIdByContext[2];
            }
        }
        return formId;
    }

}
