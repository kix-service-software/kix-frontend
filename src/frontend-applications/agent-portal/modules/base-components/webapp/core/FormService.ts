/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXModulesSocketClient } from './KIXModulesSocketClient';
import { FormInstance } from './FormInstance';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../../model/configuration/FormContext';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormFieldValueHandler } from './FormFieldValueHandler';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { EventService } from './EventService';
import { FormEvent } from './FormEvent';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { ServiceRegistry } from './ServiceRegistry';
import { KIXObjectFormService } from './KIXObjectFormService';
import { ServiceType } from './ServiceType';
import { FormPageConfiguration } from '../../../../model/configuration/FormPageConfiguration';
import { FormGroupConfiguration } from '../../../../model/configuration/FormGroupConfiguration';
import { Error } from '../../../../../../server/model/Error';
import { Context } from '../../../../model/Context';

export class FormService {

    private static INSTANCE: FormService;

    public static getInstance(): FormService {
        if (!FormService.INSTANCE) {
            FormService.INSTANCE = new FormService();
        }
        return FormService.INSTANCE;
    }

    private formFieldValueHandler: Map<KIXObjectType | string, FormFieldValueHandler[]> = new Map();

    private forms: FormConfiguration[] = [];
    private formIDsWithContext: Array<[FormContext, KIXObjectType | string, string]> = null;

    private createFormInstanceCache: Map<string, Promise<FormInstance>> = new Map();

    private constructor() { }

    public addFormFieldValueHandler(handler: FormFieldValueHandler): void {
        if (!this.formFieldValueHandler.has(handler.objectType)) {
            this.formFieldValueHandler.set(handler.objectType, []);
        }

        if (!this.formFieldValueHandler.get(handler.objectType).some((h) => h.id === handler.id)) {
            this.formFieldValueHandler.get(handler.objectType).push(handler);
        }
    }

    public getFormFieldValueHandler(objectType: KIXObjectType | string): FormFieldValueHandler[] {
        return this.formFieldValueHandler.get(objectType);
    }

    public async loadFormConfigurations(): Promise<void> {
        const formConfigurations = await KIXModulesSocketClient.getInstance().loadFormConfigurationsByContext();
        this.formIDsWithContext = formConfigurations;
    }

    public async addForm(form: FormConfiguration): Promise<void> {
        if (form) {
            const formIndex = this.forms.findIndex((f) => f.id === form.id);
            if (formIndex !== -1) {
                this.forms.splice(formIndex, 1, form);
            } else {
                this.forms.push(form);
            }
        }
    }

    public async createFormInstance(
        formId: string, kixObject: KIXObject, context: Context
    ): Promise<FormInstance> {
        if (!formId) {
            throw new Error('1', 'Missing required parameter formId.');
        }

        const key = `${formId}-${context.instanceId}`;
        let promise = this.createFormInstanceCache.get(key);

        if (!promise) {
            promise = new Promise<FormInstance>(async (resolve, reject) => {
                const formInstance = new FormInstance(context);
                await formInstance.initFormInstance(formId, kixObject).catch((e) => reject(e));
                EventService.getInstance().publish(FormEvent.FORM_INITIALIZED, formInstance);

                this.createFormInstanceCache.delete(key);
                resolve(formInstance);
            });
            this.createFormInstanceCache.set(key, promise);
        }

        return promise;
    }

    public async getForm(formId: string): Promise<FormConfiguration> {
        let form = this.forms.find((f) => f.id === formId);
        if (!form) {
            form = await KIXModulesSocketClient.getInstance().loadFormConfiguration(formId);
        }
        return { ...form };
    }

    public async getFormIdByContext(formContext: FormContext, formObject: KIXObjectType | string): Promise<string> {
        let formId;
        if (!this.formIDsWithContext?.length) {
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

    public static async createFrom(
        formFields: FormFieldConfiguration[], objectType: KIXObjectType | string,
        formName: string, formContext: FormContext
    ): Promise<FormConfiguration> {
        const form = new FormConfiguration(
            `${objectType}-template-form-${formName}`, formName, [],
            objectType,
            true, formContext, null,
            [
                new FormPageConfiguration(
                    null, null, null, true, null,
                    [
                        new FormGroupConfiguration(null, null, null, null, formFields)
                    ]
                )
            ]
        );

        return form;
    }

}
