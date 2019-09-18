/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    FormInstance, FormContext, KIXObjectType, IFormInstance, SearchFormInstance, SearchForm, Form, IFormInstanceListener
} from "../../model";
import { FormFactory } from "./FormFactory";
import { KIXModulesSocketClient } from "../modules/KIXModulesSocketClient";
import { BrowserUtil } from "../BrowserUtil";

export class FormService {

    private static INSTANCE: FormService;

    public static getInstance(): FormService {
        if (!FormService.INSTANCE) {
            FormService.INSTANCE = new FormService();
        }
        return FormService.INSTANCE;
    }

    private formInstances: Map<string, Promise<IFormInstance>> = new Map();

    private forms: Form[] = null;
    private formIDsWithContext: Array<[FormContext, KIXObjectType, string]> = null;

    private constructor() { }

    public async loadFormConfigurations(): Promise<void> {
        const formConfigurations = await KIXModulesSocketClient.getInstance().loadFormConfigurations();
        this.forms = formConfigurations[0];
        this.formIDsWithContext = formConfigurations[1];
    }

    public async addForm(form: Form): Promise<void> {
        if (!this.forms) {
            await this.loadFormConfigurations();
        }
        const formIndex = this.forms.findIndex((f) => f.id === form.id);
        if (formIndex !== -1) {
            this.forms.splice(formIndex, 1, form);
        } else {
            this.forms.push(form);
        }
    }

    public async getFormInstance<T extends IFormInstance>(
        formId: string, cache: boolean = true, form?: Form
    ): Promise<T> {
        if (formId) {
            if (!this.formInstances.has(formId) || !cache) {
                const formInstance = this.getNewFormInstance(formId, form);
                this.formInstances.set(formId, formInstance);
            }
            return await this.formInstances.get(formId) as T;
        }
        return;
    }

    private getNewFormInstance(formId: string, form?: Form): Promise<IFormInstance> {
        return new Promise<IFormInstance>(async (resolve, reject) => {
            this.deleteFormInstance(formId);
            if (!form) {
                const configuredForm = await this.getForm(formId);
                if (configuredForm) {
                    form = { ...configuredForm };
                } else {
                    BrowserUtil.openErrorOverlay(`No form configuration found for id ${formId}`);
                    reject();
                }
            }

            FormFactory.initForm(form);
            if (form.formContext === FormContext.SEARCH) {
                resolve(new SearchFormInstance((form as SearchForm)));
            } else {
                const formInstance = new FormInstance(form);
                await formInstance.initFormInstance();
                resolve(formInstance);
            }
        });
    }

    public async getForm(formId: string): Promise<Form> {
        if (!this.forms) {
            await this.loadFormConfigurations();
        }
        return this.forms.find((f) => f.id === formId);
    }

    public deleteFormInstance(formId: string): void {
        if (formId && this.formInstances.has(formId)) {
            this.formInstances.delete(formId);
        }
    }

    public async getFormIdByContext(formContext: FormContext, formObject: KIXObjectType): Promise<string> {
        let formId;
        if (!this.formIDsWithContext) {
            await this.loadFormConfigurations();
        }

        const formIdByContext = this.formIDsWithContext.find(
            (fidwc) => fidwc[0] === formContext && fidwc[1] === formObject
        );
        if (formIdByContext && formIdByContext[2]) {
            formId = formIdByContext[2];
        }
        return formId;
    }

    public async registerFormInstanceListener(formId: string, listener: IFormInstanceListener): Promise<void> {
        const formInstance = await this.getFormInstance(formId);
        formInstance.registerListener(listener);
    }

    public async removeFormInstanceListener(formId: string, listenerId: string): Promise<void> {
        if (this.formInstances.has(formId)) {
            const formInstance = await this.getFormInstance(formId);
            formInstance.removeListener(listenerId);
        }
    }

}
