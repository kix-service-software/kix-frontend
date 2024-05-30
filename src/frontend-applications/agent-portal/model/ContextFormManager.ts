/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AdditionalContextInformation } from '../modules/base-components/webapp/core/AdditionalContextInformation';
import { ContextFormManagerEvents } from '../modules/base-components/webapp/core/ContextFormManagerEvents';
import { ContextService } from '../modules/base-components/webapp/core/ContextService';
import { EventService } from '../modules/base-components/webapp/core/EventService';
import { FormEvent } from '../modules/base-components/webapp/core/FormEvent';
import { FormInstance } from '../modules/base-components/webapp/core/FormInstance';
import { FormService } from '../modules/base-components/webapp/core/FormService';
import { IEventSubscriber } from '../modules/base-components/webapp/core/IEventSubscriber';
import { KIXObjectService } from '../modules/base-components/webapp/core/KIXObjectService';
import { ObjectFormEvent } from '../modules/object-forms/model/ObjectFormEvent';
import { ObjectFormHandler } from '../modules/object-forms/webapp/core/ObjectFormHandler';
import { ObjectFormRegistry } from '../modules/object-forms/webapp/core/ObjectFormRegistry';
import { FormConfiguration } from './configuration/FormConfiguration';
import { FormContext } from './configuration/FormContext';
import { FormFieldConfiguration } from './configuration/FormFieldConfiguration';
import { FormFieldValue } from './configuration/FormFieldValue';
import { Context } from './Context';
import { ContextMode } from './ContextMode';
import { ContextPreference } from './ContextPreference';
import { IdService } from './IdService';
import { KIXObject } from './kix/KIXObject';

export class ContextFormManager {

    public formId: string;

    protected formInstance: FormInstance;
    protected formSubscriber: IEventSubscriber;
    protected activeFormPageIndex: number;
    protected form: FormConfiguration;

    private storageTimeout: any;

    private createObjectHandlerPromise: Promise<void>;
    private handler: ObjectFormHandler;
    public useObjectForms: boolean;

    public constructor(protected context?: Context) {
        this.formSubscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: any, eventId: string): void => {
                if (eventId === FormEvent.VALUES_CHANGED) {
                    this.handleValueChanged(data.formInstance);
                } else {
                    this.handleValueChanged();
                }
            }
        };

        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
        EventService.getInstance().subscribe(ObjectFormEvent.OBJECT_FORM_VALUE_CHANGED, this.formSubscriber);
    }

    public setContext(context: Context): void {
        this.context = context;
    }

    public async destroy(): Promise<void> {
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
        EventService.getInstance().unsubscribe(ObjectFormEvent.OBJECT_FORM_VALUE_CHANGED, this.formSubscriber);
        if (this.useObjectForms) {
            const objectFormHandler = await this.getObjectFormHandler();
            objectFormHandler?.destroy();
        }
    }

    public async setFormId(
        formId: string, kixObject?: KIXObject, useObjectForms?: boolean, createNewInstance: boolean = true
    ): Promise<void> {
        this.useObjectForms = useObjectForms;

        if (this.formId !== formId || createNewInstance) {
            this.formId = formId;

            if (this.useObjectForms) {
                await this.getObjectFormHandler(createNewInstance);
            } else {
                await this.getFormInstance(true, undefined, kixObject);
            }
        }
    }

    public async getObjectFormHandler(createNewInstance?: boolean): Promise<ObjectFormHandler> {
        if (this.formId && createNewInstance) {
            this.handler?.destroy();

            if (!this.createObjectHandlerPromise) {
                this.createObjectHandlerPromise = this.createObjectFormhandler();
            }

            await this.createObjectHandlerPromise;
            this.createObjectHandlerPromise = null;
        }

        return this.handler;
    }

    private async createObjectFormhandler(): Promise<void> {
        this.form = await FormService.getInstance().getForm(this.formId);

        const start = Date.now();

        this.handler = new ObjectFormHandler(this.context);
        EventService.getInstance().publish(FormEvent.OBJECT_FORM_HANDLER_CHANGED, this.context);

        await this.handler.loadForm(true);

        const end = Date.now();
        console.debug(`ObjectFormHandler created: ${(end - start)}ms`);
    }

    public getForm(): FormConfiguration {
        return this.form;
    }

    private handleValueChanged(formInstance?: FormInstance): void {
        if (this.storageTimeout) {
            if (typeof window !== 'undefined') {
                window.clearTimeout(this.storageTimeout);
            }
            this.storageTimeout = null;
        }

        this.storageTimeout = setTimeout(async () => {
            let isStoreable = await ContextService.getInstance().isContextStored(this.context?.instanceId);
            const isFormInstance = !formInstance || (formInstance?.instanceId === this.formInstance?.instanceId);
            isStoreable = isStoreable && isFormInstance;

            if (isStoreable) {
                ContextService.getInstance().updateStorage(this.context?.instanceId);
            }
            this.storageTimeout = null;
        }, 2000);
    }

    public async getFormId(): Promise<string> {
        if (!this.formId) {
            const contextMode = this.context?.descriptor?.contextMode;
            const objectType = this.context?.descriptor?.kixObjectTypes[0];

            const formContext = this.getFormContext(contextMode);

            this.formId = await FormService.getInstance().getFormIdByContext(formContext, objectType);
        }

        return this.formId;
    }

    private getFormContext(contextMode: ContextMode): FormContext {
        let formContext: FormContext;

        switch (contextMode) {
            case ContextMode.EDIT:
            case ContextMode.EDIT_ADMIN:
            case ContextMode.EDIT_BULK:
                formContext = FormContext.EDIT;
                break;
            case ContextMode.SEARCH:
                formContext = FormContext.SEARCH;
                break;
            case ContextMode.EDIT_LINK:
                formContext = FormContext.LINK;
                break;
            default:
                formContext = FormContext.NEW;
        }

        return formContext;
    }

    public async getFormInstance(
        createNewInstance?: boolean, silent?: boolean, object?: KIXObject
    ): Promise<FormInstance> {
        if (!this.formInstance || createNewInstance) {
            const formId = await this.getFormId();
            object ||= await this.context.getObject();
            if (formId) {
                this.formInstance = await FormService.getInstance().createFormInstance(
                    formId, object, this.context
                );
                if (!silent) {
                    EventService.getInstance().publish(
                        ContextFormManagerEvents.FORM_INSTANCE_CHANGED, this.formInstance
                    );
                }
            }
        }

        return this.formInstance;
    }

    public async addStorableValue(contextPreference: ContextPreference): Promise<void> {
        const replacerFunc = (): (key: string, value: any) => string => {
            const visited = new WeakSet();
            return (key: string, value: any): string => {
                if (typeof value === 'object' && value !== null) {
                    if (visited.has(value)) {
                        return;
                    }
                    visited.add(value);
                }
                return value;
            };
        };

        if (this.useObjectForms) {

            const object = await this.context?.getObject();

            if (object) {
                const formhandler = await this.getObjectFormHandler();
                const commitHandler = ObjectFormRegistry.getInstance().createObjectCommitHandler(
                    formhandler?.objectFormValueMapper
                );

                const preparedObject = await commitHandler?.prepareObject(
                    object, formhandler?.objectFormValueMapper, false
                );
                contextPreference.formObject = JSON.stringify(preparedObject);
            }

        } else if (this.formInstance) {
            const formObject = {};
            formObject['form'] = this.formInstance.getForm();

            const formFieldValues = [];
            this.formInstance.getAllFormFieldValues().forEach(
                (value: FormFieldValue, key: string) => formFieldValues.push([key, value])
            );
            formObject['formFieldValues'] = formFieldValues;

            const fixedValues = [];
            this.formInstance.getFixedValues().forEach(
                (value: [FormFieldConfiguration, FormFieldValue], key: string) => fixedValues.push([key, value])
            );
            formObject['fixedValues'] = fixedValues;

            const templateValues = [];
            this.formInstance.getTemplateValues().forEach(
                (value: [FormFieldConfiguration, FormFieldValue], key: string) => templateValues.push([key, value])
            );
            formObject['templateValues'] = templateValues;

            contextPreference.formValue = JSON.stringify(formObject, replacerFunc());
        }
    }

    public async loadStoredValue(contextPreference: ContextPreference): Promise<void> {
        if (contextPreference?.formValue) {
            this.formInstance = new FormInstance(this.context);

            const storedValue = JSON.parse(contextPreference.formValue);
            (this.formInstance as any).form = storedValue?.form;
            this.formId = storedValue?.form?.id;

            if (Array.isArray(storedValue?.formFieldValues)) {
                const map = new Map();
                storedValue?.formFieldValues.forEach((v) => map.set(v[0], v[1]));
                (this.formInstance as any).formFieldValues = map;
            }

            if (Array.isArray(storedValue?.templateValues)) {
                const map = new Map();
                storedValue?.templateValues.forEach((v) => map.set(v[0], v[1]));
                (this.formInstance as any).templateValues = map;
            }

            if (Array.isArray(storedValue?.fixedValues)) {
                const map = new Map();
                storedValue?.fixedValues.forEach((v) => map.set(v[0], v[1]));
                (this.formInstance as any).fixedValues = map;
            }
        } else if (contextPreference.formObject) {
            const object = JSON.parse(contextPreference.formObject);
            const formObject = KIXObjectService.createObjectInstance(object.KIXObjectType, object);
            this.context.setAdditionalInformation(AdditionalContextInformation.FORM_OBJECT, formObject);
        }
    }

    public setActiveFormPageIndex(index: number): void {
        this.activeFormPageIndex = index;
    }

    public getActiveFormPageIndex(): number {
        return this.activeFormPageIndex;
    }

}
