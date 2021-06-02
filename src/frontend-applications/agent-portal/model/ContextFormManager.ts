/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextFormManagerEvents } from '../modules/base-components/webapp/core/ContextFormManagerEvents';
import { ContextService } from '../modules/base-components/webapp/core/ContextService';
import { EventService } from '../modules/base-components/webapp/core/EventService';
import { FormEvent } from '../modules/base-components/webapp/core/FormEvent';
import { FormInstance } from '../modules/base-components/webapp/core/FormInstance';
import { FormService } from '../modules/base-components/webapp/core/FormService';
import { IEventSubscriber } from '../modules/base-components/webapp/core/IEventSubscriber';
import { FormContext } from './configuration/FormContext';
import { FormFieldConfiguration } from './configuration/FormFieldConfiguration';
import { FormFieldValue } from './configuration/FormFieldValue';
import { Context } from './Context';
import { ContextMode } from './ContextMode';
import { ContextPreference } from './ContextPreference';
import { IdService } from './IdService';

export class ContextFormManager {

    protected formInstance: FormInstance;
    protected formId: string;
    protected formSubscriber: IEventSubscriber;

    private storageTimeout: any;

    public constructor(protected context?: Context) {
        this.formSubscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: any, eventId: string) => {
                this.handleValueChanged(data.formInstance);
            }
        };

        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    public setContext(context: Context): void {
        this.context = context;
    }

    private handleValueChanged(formInstance: FormInstance): void {
        if (this.storageTimeout) {
            if (typeof window !== 'undefined') {
                window.clearTimeout(this.storageTimeout);
            }
            this.storageTimeout = null;
        }

        this.storageTimeout = setTimeout(async () => {
            if (formInstance?.instanceId === this.formInstance?.instanceId) {
                const isStored = await ContextService.getInstance().isContextStored(this.context?.instanceId);
                if (isStored) {
                    ContextService.getInstance().updateStorage(this.context?.instanceId);
                }
            }
            this.storageTimeout = null;
        }, 1000);
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
            case ContextMode.EDIT_LINKS:
                formContext = FormContext.LINK;
                break;
            default:
                formContext = FormContext.NEW;
        }

        return formContext;
    }

    public async getFormInstance(createNewInstance?: boolean, silent?: boolean): Promise<FormInstance> {
        if (!this.formInstance || createNewInstance) {
            const formId = await this.getFormId();
            const object = await this.context.getObject();
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

    public async setFormId(formId: string): Promise<void> {
        if (this.formId !== formId) {
            this.formId = formId;
            await this.getFormInstance(true);
        }
    }

    public async addStorableValue(contextPreference: ContextPreference): Promise<void> {
        const replacerFunc = () => {
            const visited = new WeakSet();
            return (key: string, value: any) => {
                if (typeof value === 'object' && value !== null) {
                    if (visited.has(value)) {
                        return;
                    }
                    visited.add(value);
                }
                return value;
            };
        };

        if (this.formInstance) {
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
        if (contextPreference && contextPreference.formValue) {
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
        }
    }

}
