/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormContext } from '../../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { IdService } from '../../../../model/IdService';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { PlaceholderService } from '../../../base-components/webapp/core/PlaceholderService';
import { ValidationResult } from '../../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../base-components/webapp/core/ValidationSeverity';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ObjectFormRegistry } from '../../webapp/core/ObjectFormRegistry';
import { FormValueBinding } from '../FormValueBinding';
import { FormValueProperty } from '../FormValueProperty';
import { ObjectFormValueMapper } from '../ObjectFormValueMapper';
import { FormValueAction } from './FormValueAction';


export class ObjectFormValue<T = any> {

    public instanceId: string;

    protected bindings: FormValueBinding[] = [];

    public value: T;
    public formValues: ObjectFormValue[] = [];
    public label: string = this.property;
    public hint: string;
    public possibleValues: any[] = null;
    public additionalValues: any[] = null;
    public forbiddenValues: any[] = null;
    public required: boolean = false;
    public readonly: boolean = false;
    public visible: boolean = false;
    public enabled: boolean = false;

    public valid: boolean = true;
    public validationResults: ValidationResult[] = [];

    public countDefault: number = 1;
    public countMin: number = 1;
    public countMax: number = 1;

    public regExList: Array<{ regEx: string, errorMessage: string }>;

    public inputComponentId = 'text-form-input';

    public actions: FormValueAction[] = [];

    public isSortable: boolean = true;

    public isSetInBackground: boolean = false;

    protected initialState: Map<string, any> = new Map();

    public constructor(
        public property: string,
        protected object: any,
        public objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue
    ) {
        this.instanceId = IdService.generateDateBasedId();
        if (object) {
            this.value = object[property];
            this.createBindings(property, object);
        }
    }

    public getInitialState(property: string): any {
        return this.initialState.get(property);
    }

    public setInitialState(): void {
        this.initialState.set('countDefault', this.countDefault);
        this.initialState.set('countMax', this.countMax);
        this.initialState.set('countMin', this.countMin);
        this.initialState.set('enabled', this.enabled);
        this.initialState.set('hint', this.hint);
        this.initialState.set('label', this.label);
        this.initialState.set('possibleValues', Array.isArray(this.possibleValues) ? [...this.possibleValues] : null);
        this.initialState.set('forbiddenValues', Array.isArray(this.forbiddenValues) ? [...this.forbiddenValues] : null);
        this.initialState.set('additionalValues', Array.isArray(this.additionalValues) ? [...this.additionalValues] : null);
        this.initialState.set('readonly', this.readonly);
        this.initialState.set('regExList', this.regExList);
        this.initialState.set('required', this.required);
        this.initialState.set('visible', this.visible);
    }

    public setNewInitialState(property: string, value: any): void {
        if (property) {
            this.initialState.set(property, value);
        }
    }

    public destroy(): void {
        for (const binding of this.bindings) {
            binding.destroy();
        }

        if (this.actions?.length) {
            for (const a of this.actions) {
                a.destroy();
            }
        }
    }

    public async reset(
        ignoreProperties: string[] = [], ignoreFormValueProperties: string[] = [], ignoreFormValueReset: string[] = []
    ): Promise<void> {

        if (!ignoreFormValueReset.some((i) => i === this.instanceId)) {
            let property = this.property;
            if ((this as any).dfName) {
                property = `DynamicFields.${(this as any).dfName}`;
            }

            if (!ignoreProperties.some((p) => p === property)) {
                const iter = this.initialState.keys();
                let key = iter.next();
                while (key?.value) {
                    if (!ignoreFormValueProperties.some((p) => p === key.value)) {
                        if (this[key.value] !== this.initialState.get(key.value)) {
                            if (key.value === FormValueProperty.ENABLED) {
                                // call disable if enabled is reseted
                                if (this.enabled) {
                                    await this.disable();
                                } else {
                                    await this.enable();
                                }
                            } else {
                                this[key.value] = this.initialState.get(key.value);
                            }
                        }
                    }
                    key = iter.next();
                }
            }
        }

        if (this.formValues?.length) {
            for (const fv of this.formValues) {
                if (!ignoreFormValueReset.some((i) => i === fv.instanceId)) {
                    await fv.reset(ignoreProperties, ignoreFormValueProperties, ignoreFormValueReset);
                }
            }
        }
    }

    public async resetProperty(property: string): Promise<void> {
        if (this.initialState.has(property)) {
            this[property] = this.initialState.get(property);
        }
    }

    protected createBindings(property: string, object: any): void {
        if (property && object) {
            this.bindings.push(
                new FormValueBinding(this, FormValueProperty.VALUE, object, property),
                new FormValueBinding(this, FormValueProperty.POSSIBLE_VALUES, object, property),
                new FormValueBinding(this, FormValueProperty.READ_ONLY, object, property),
                new FormValueBinding(this, FormValueProperty.REQUIRED, object, property),
                new FormValueBinding(this, FormValueProperty.VALID, object, property),
                new FormValueBinding(this, FormValueProperty.VALIDATION_RESULTS, object, property),
                new FormValueBinding(this, FormValueProperty.VISIBLE, object, property),
                new FormValueBinding(this, FormValueProperty.ENABLED, object, property),
                new FormValueBinding(this, FormValueProperty.COUNT_MAX, object, property),
                new FormValueBinding(this, FormValueProperty.REG_EX_LIST, object, property),
                new FormValueBinding(this, FormValueProperty.FORM_VALUES, object, property)
            );

            this.addPropertyBinding(FormValueProperty.REG_EX_LIST, () => {
                if (Array.isArray(this.formValues)) {
                    for (const formValue of this.formValues) {
                        formValue.regExList = this.regExList;
                    }
                } else if (this.regExList?.length) {
                    this.objectValueMapper?.validateFormValue(this, true);
                }
            });
        }
    }

    public addPropertyBinding(property: string, cb: (value: ObjectFormValue) => void): string {
        let id: string;
        const binding = this.bindings.find((b) => b.property === property);
        if (binding) {
            id = binding.addBinding(cb);
        }

        return id;
    }

    public removePropertyBinding(bindingIds: string[]): void {
        for (const binding of this.bindings) {
            binding.removeBindings(bindingIds);
        }

        if (this.formValues?.length) {
            for (const formValue of this.formValues) {
                formValue.removePropertyBinding(bindingIds);
            }
        }
    }

    public async enable(): Promise<void> {
        if (!this.enabled) {
            this.enabled = true;
            await this.initFormValue();
        }
    }

    public async disable(): Promise<void> {
        this.enabled = false;
        this.value = null;
    }

    public async show(): Promise<void> {
        if (!this.visible) {
            this.visible = true;
            if (this.formValues?.length > 0) {
                this.formValues.forEach((fv) => fv.show());
            }
        }
    }

    public async hide(): Promise<void> {
        if (this.visible) {
            this.visible = false;
            if (this.formValues?.length > 0) {
                this.formValues.forEach((fv) => fv.hide());
            }
        }
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        const isEdit = this.objectValueMapper.formContext === FormContext.EDIT;

        const defaultValue = field.defaultValue?.value;
        let hasDefaultValue = (typeof defaultValue !== 'undefined' && defaultValue !== null && defaultValue !== '');
        if (Array.isArray(defaultValue)) {
            hasDefaultValue = defaultValue.length > 0;
        }

        if (field.empty) {
            this.setFormValue(null, true);
        } else if ((!this.value || isEdit) && hasDefaultValue && !field.empty) {
            const value = await this.handlePlaceholders(field.defaultValue?.value);
            this.setFormValue(value, true);
        }

        this.enabled = true;
        this.visible = field.visible;
        this.setNewInitialState(FormValueProperty.VISIBLE, this.visible);
        this.readonly = field.readonly;
        this.setNewInitialState(FormValueProperty.READ_ONLY, this.readonly);
        this.required = field.required;
        this.setNewInitialState(FormValueProperty.REQUIRED, this.required);
        this.isSetInBackground = field.options.some((o) => o.option === 'set hidden') || this.parent?.isSetInBackground;

        if (field?.property !== KIXObjectProperty.DYNAMIC_FIELDS) {
            this.label = field.label;
            if (!this.label) {
                this.label = await LabelService.getInstance().getPropertyText(
                    field.property, this.object?.KIXObjectType
                );
            }
        }

        if (!this.hint) {
            this.hint = await TranslationService.translate(field.hint);
        }
    }

    public async initFormValue(): Promise<void> {
        this.actions = await ObjectFormRegistry.getInstance().getActions(this, this.objectValueMapper);
        if (!this.value && this.object[this.property]) {
            this.setFormValue(this.object[this.property]);
        }

        if (!this.label || this.label === this.property) {
            this.label = await LabelService.getInstance().getPropertyText(
                this.property, this.object?.KIXObjectType
            );
        }
    }

    protected async handlePlaceholders(value: any, forRichtext?: boolean): Promise<any> {
        if (value) {

            const placeholderObject = this.objectValueMapper?.sourceObject || this.objectValueMapper?.object;

            if (typeof value === 'string' && PlaceholderService.getInstance().extractPlaceholders(value)) {
                const newValue = await PlaceholderService.getInstance().replacePlaceholders(
                    value, placeholderObject, null, forRichtext
                );
                value = newValue as any || null;
            } else if (Array.isArray(value)) {
                const newValuePromises = [];
                value.forEach((v) => {
                    if (typeof v === 'string' && PlaceholderService.getInstance().extractPlaceholders(v)) {
                        newValuePromises.push(
                            PlaceholderService.getInstance().replacePlaceholders(
                                v, placeholderObject
                            )
                        );
                    } else {
                        newValuePromises.push(new Promise((resolve) => resolve(v)));
                    }
                });

                let newValue = await Promise.all(newValuePromises);

                // values like [ [1,2], [3,4] ] are not usable, flatten them ([1,2,3,4]) to one level depth
                // could be, because given value is something like [ '<KIX_TICKET_DynamicField_DFName_ObjectValue> ' ]
                // so result would be an array
                newValue = newValue.flat();

                newValue = newValue.filter((v) => v !== '' && v !== null && typeof v !== 'undefined');
                value = newValue as any;
            }
        }

        return value;
    }

    public findFormValue(property: string): ObjectFormValue {
        let formValue: ObjectFormValue;
        for (const fv of this.formValues) {
            formValue = fv.findFormValue(property);

            if (formValue) {
                break;
            }

            if (fv.property === property) {
                formValue = fv;
                break;
            }
        }

        return formValue;
    }

    public async setObjectValue(value: any): Promise<void> {
        // INFO: do not check readonly here - it is only relevant for form value!
        if (this.object) {
            this.object[this.property] = value;
            // Hint: do not trigger setObjectValueToFormValue here (it is already done by binding (FormValueBinding))
        }
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        if ((force || !this.readonly) && !this.isSameValue(value)) {
            this.value = value;
        }
    }

    protected isSameValue(value: any): boolean {
        if (
            !this.hasValue(this.value) &&
            !this.hasValue(value)
        ) return true;
        let isSameValue = false;
        if (Array.isArray(this.value) && Array.isArray(value)) {
            isSameValue = this.value.length === value.length;
            if (isSameValue) {
                isSameValue = this.value.every((v) => value.every((val) => v?.toString() === val?.toString()));
            }
        } else {
            isSameValue = this.value === value;
        }

        return isSameValue;
    }

    protected hasValue(value: any): boolean {
        if (value !== 0 && (!value || Array.isArray(value) && !value.length)) return false;
        if (Array.isArray(value) && value.length) {
            let hasValue = false;
            value.forEach((v) => {
                hasValue = hasValue || this.hasValue(v);
            });
            return hasValue;
        }
        return true;
    }

    public removeValue(value: any): void {
        this.setFormValue(null);
    }

    public async setPossibleValues(values: T[]): Promise<void> {
        this.possibleValues = Array.isArray(values) ? values : values ? [values] : [];
    }

    public async addPossibleValues(values: T[]): Promise<void> {
        if (Array.isArray(values)) {
            if (!Array.isArray(this.additionalValues)) {
                this.additionalValues = [];
            }

            for (const av of values) {
                if (!this.additionalValues?.some((v) => v?.toString() === av?.toString())) {
                    this.additionalValues.push(av);
                }
            }
        }
    }

    public async removePossibleValues(values: T[]): Promise<void> {
        if (Array.isArray(this.forbiddenValues)) {
            for (const v of values) {
                if (!this.forbiddenValues.some((fv) => fv.toString() === v.toString())) {
                    this.forbiddenValues.push(v);
                }
            }
        } else {
            this.forbiddenValues = values;
        }
    }

    public setValidationResult(validationResult: ValidationResult[] = []): void {
        this.valid = !validationResult.some((r) => r.severity === ValidationSeverity.ERROR);
        this.validationResults = validationResult;
    }

    protected async applyPossibleValues(): Promise<void> {
        let value: any = this.value;
        if (this.value && !Array.isArray(this.value)) {
            value = [this.value];
        }

        if (Array.isArray(value) && (this.possibleValues || this.forbiddenValues)) {
            const newValue = [];
            for (const v of value) {
                const isPossible = this.possibleValues?.some((pv) => pv.toString() === v.toString());
                const isAdditional = this.additionalValues?.some((pv) => pv.toString() === v.toString());
                const isForbidden = this.forbiddenValues?.some((pv) => pv.toString() === v.toString());
                if ((isPossible || isAdditional) && !isForbidden) {
                    newValue.push(v);
                }
            }

            // force - only selectable values
            if (newValue.length) {
                this.setFormValue(newValue, true);
            } else {
                this.setFormValue(null, true);
            }
        }
    }

    public deleteObjectValue(object: KIXObject): void {
        delete object[this.property];
    }

    public getValueActionClasses(): Array<new (
        formValue: ObjectFormValue, objectValueMapper: ObjectFormValueMapper
    ) => FormValueAction> {
        return;
    }

    public async update(): Promise<void> {
        await this.applyPossibleValues();
    }

}