import {
    FormInstance, FormContext, KIXObjectType, IFormInstance, SearchFormInstance, SearchForm, Form, IFormInstanceListener
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

    public addform(form: Form): void {
        if (this.forms) {
            const formIndex = this.forms.findIndex((f) => f.id === form.id);
            if (formIndex !== 1) {
                this.forms.splice(formIndex, 1, form);
            } else {
                this.forms.push(form);
            }
        }
    }

    public async getFormInstance<T extends IFormInstance>(
        formId: string, cache: boolean = true, form?: Form
    ): Promise<T> {
        let formInstance;
        if (formId) {
            if (this.formInstances.has(formId) && cache) {
                formInstance = this.formInstances.get(formId);
            } else {
                this.deleteFormInstance(formId);
                if (!form && this.forms) {
                    const configuredForm = this.getForm(formId);
                    if (configuredForm) {
                        form = { ...configuredForm };
                    } else {
                        BrowserUtil.openErrorOverlay(`No form configuration found for id ${formId}`);
                    }
                }

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
        return formInstance;
    }

    public getForm(formId: string): Form {
        return this.forms.find((f) => f.id === formId);
    }

    public deleteFormInstance(formId: string): void {
        if (formId && this.formInstances.has(formId)) {
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

    public async registerFormInstanceListener(formId: string, listener: IFormInstanceListener): Promise<void> {
        const formInstance = await this.getFormInstance(formId);
        formInstance.registerListener(listener);
    }

    public removeFormInstanceListener(formId: string, listenerId: string): void {
        if (this.formInstances.has(formId)) {
            const formInstance = this.formInstances.get(formId);
            formInstance.removeListener(listenerId);
        }
    }

}
