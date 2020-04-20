/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IFormInstance } from "./IFormInstance";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { ISearchFormListener } from "./ISearchFormListener";
import { SearchForm } from "./SearchForm";
import { FormConfiguration } from "../../../../model/configuration/FormConfiguration";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { FormFieldValue } from "../../../../model/configuration/FormFieldValue";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { IFormInstanceListener } from "./IFormInstanceListener";
import { ValidationResult } from "./ValidationResult";
import { AutoCompleteConfiguration } from "../../../../model/configuration/AutoCompleteConfiguration";
import { FormContext } from "../../../../model/configuration/FormContext";
import { FormPageConfiguration } from "../../../../model/configuration/FormPageConfiguration";

export class SearchFormInstance implements IFormInstance {

    private filterCriteria: FilterCriteria[] = [];

    private listeners: ISearchFormListener[] = [];

    public constructor(public form: SearchForm) { }

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

    public async provideFormField(formField: FormFieldConfiguration): Promise<void> {
        return;
    }

    public removeFormField(formField: FormFieldConfiguration): void {
        return;
    }

    public setFieldEmptyState(formField: FormFieldConfiguration, empty?: boolean): void {
        return;
    }

    public removePages(pageIds: string[]): Promise<void> {
        return;
    }

    public addFormField(formField: FormFieldConfiguration): void {
        return;
    }

    public addPage(page: FormPageConfiguration, index?: number): void {
        return;
    }

    public addNewFormField(
        parent: FormFieldConfiguration, newFields: FormFieldConfiguration[], clearChildren?: boolean
    ): void {
        return;
    }

    public provideFormFieldValue<T>(fieldId: string, value: T): void {
        return;
    }

    public getFormFieldValue<T>(
        fieldId: string
    ): FormFieldValue<T> {
        const criteria = this.filterCriteria.find((fc) => fc.property === fieldId);
        if (criteria) {
            return new FormFieldValue<any>(criteria.value, true);
        }
    }

    public async getFormFieldValueByProperty<T>(property: string): Promise<FormFieldValue<T>> {
        return null;
    }

    public async getFormFieldByProperty(property: string): Promise<FormFieldConfiguration> {
        return null;
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

    public registerListener(listener: IFormInstanceListener): void {
        return;
    }

    public removeListener(listenerId: string): void {
        return;
    }

    public async validateForm(): Promise<ValidationResult[]> {
        return [];
    }

    public async validateField(field: FormFieldConfiguration): Promise<ValidationResult> {
        return;
    }

    public getAutoCompleteConfiguration(): AutoCompleteConfiguration {
        return new AutoCompleteConfiguration();
    }

    public getFormContext(): FormContext {
        return this.form.formContext;
    }

}
