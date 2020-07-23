/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FilterCriteria } from '../../../../model/FilterCriteria';
import { ISearchFormListener } from './ISearchFormListener';
import { SearchForm } from './SearchForm';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormContext } from '../../../../model/configuration/FormContext';
import { FormService } from './FormService';

export class SearchFormInstance {

    private static INSTANCE: SearchFormInstance;

    public static getInstance(): SearchFormInstance {
        if (!SearchFormInstance.INSTANCE) {
            SearchFormInstance.INSTANCE = new SearchFormInstance();
        }
        return SearchFormInstance.INSTANCE;
    }

    private constructor() { }

    private form: FormConfiguration;

    private filterCriteria: FilterCriteria[] = [];

    private listeners: ISearchFormListener[] = [];

    public async setForm(formId: string): Promise<void> {
        this.form = await FormService.getInstance().getForm(formId);
    }

    public getForm(): FormConfiguration {
        return this.form;
    }

    public setFilterCriteria(filterCriteria: FilterCriteria): void {
        const index = this.filterCriteria.findIndex((fc) => fc.property === filterCriteria.property);
        if (index !== -1) {
            this.removeFilterCriteria(filterCriteria);
        }
        this.filterCriteria.push(filterCriteria);
        this.listeners.forEach((l) => l.searchCriteriaChanged(this.filterCriteria));
    }

    public removeFilterCriteria(filterCriteria: FilterCriteria): void {
        const index = this.filterCriteria.findIndex((fc) => fc.property === filterCriteria.property);
        if (index !== -1) {
            this.filterCriteria.splice(index, 1);
        }
        this.listeners.forEach((l) => l.searchCriteriaChanged(this.filterCriteria));
    }

    public clearCriteria(): void {
        this.filterCriteria = [];
    }

    public getFormFieldValue<T>(
        fieldId: string
    ): FormFieldValue<T> {
        const criteria = this.filterCriteria.find((fc) => fc.property === fieldId);
        if (criteria) {
            return new FormFieldValue<any>(criteria.value, true);
        }
    }

    public getCriteria(): FilterCriteria[] {
        return this.filterCriteria;
    }

    public getAllFormFieldValues(): Map<string, FormFieldValue<any>> {
        return new Map();
    }

    public async getFormField(fieldId: string): Promise<FormFieldConfiguration> {
        return null;
    }

    public hasValues(): boolean {
        return this.filterCriteria.length && !this.filterCriteria.some((fc) => fc.value === null);
    }

    public getObjectType(): KIXObjectType | string {
        return this.form.objectType;
    }

    public reset(): void {
        this.filterCriteria = [];
        this.listeners.forEach((l) => l.formReseted());
    }

    public registerSearchFormListener(listener: ISearchFormListener): void {
        const listenerIndex = this.listeners.findIndex((l) => l.listenerId === listener.listenerId);
        if (listenerIndex !== -1) {
            this.listeners[listenerIndex] = listener;
        } else {
            this.listeners.push(listener);
        }
    }

    public removeSearchFormListener(listenerId: string): void {
        const listenerIndex = this.listeners.findIndex((l) => l.listenerId === listenerId);
        if (listenerIndex !== -1) {
            this.listeners.splice(listenerIndex, 1);
        }
    }

    public getFormContext(): FormContext {
        return this.form.formContext;
    }

}
