import { FilterCriteria } from "../../FilterCriteria";
import { FormFieldValue } from "./events";
import { IFormInstance } from "./IFormInstance";
import { KIXObjectType } from "../../kix";
import { FormField } from "./FormField";
import { IFormInstanceListener } from "./IFormInstanceListener";
import { ValidationResult } from "./ValidationResult";
import { AutoCompleteConfiguration } from "./AutoCompleteConfiguration";
import { FormContext } from "./FormContext";
import { SearchForm } from "./SearchForm";
import { ISearchFormListener } from "./ISearchFormListener";
import { KIXObjectSearchService } from "../../../browser";
import { Form } from "./Form";

export class SearchFormInstance implements IFormInstance {

    private filterCriteria: FilterCriteria[] = [];

    private listeners: ISearchFormListener[] = [];

    public constructor(public form: SearchForm) { }

    public setFilterCriteria(filterCriteria: FilterCriteria): void {
        const index = this.filterCriteria.findIndex((fc) => fc.property === filterCriteria.property);
        if (index !== -1) {
            this.removeFilterCriteria(filterCriteria);
        }
        this.filterCriteria.push(filterCriteria);
        this.listeners.forEach((l) => l.searchCriteriaChanged(this.filterCriteria));
    }

    public getForm(): Form {
        return this.form;
    }

    public removeFilterCriteria(filterCriteria: FilterCriteria): void {
        const index = this.filterCriteria.findIndex((fc) => fc.property === filterCriteria.property);
        if (index !== -1) {
            this.filterCriteria.splice(index, 1);
        }
        this.listeners.forEach((l) => l.searchCriteriaChanged(this.filterCriteria));
    }

    public async provideFormField(formField: FormField): Promise<void> {
        return;
    }

    public removeFormField(formField: FormField<any>): void {
        return;
    }

    public addFormField(formField: FormField<any>): void {
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

    public getCriteria(): FilterCriteria[] {
        return this.filterCriteria;
    }

    public getAllFormFieldValues(): Map<string, FormFieldValue<any>> {
        return new Map();
    }

    public async getFormField(fieldId: string): Promise<FormField> {
        const componentId = await KIXObjectSearchService.getInstance().getInputComponentId(
            this.getObjectType(), fieldId
        );
        return new FormField(fieldId, fieldId, componentId);
    }

    public hasValues(): boolean {
        return this.filterCriteria.length && !this.filterCriteria.some((fc) => fc.value === null);
    }

    public getObjectType(): KIXObjectType {
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

    public getAutoCompleteConfiguration(): AutoCompleteConfiguration {
        return new AutoCompleteConfiguration();
    }

    public getFormContext(): FormContext {
        return this.form.formContext;
    }

}
