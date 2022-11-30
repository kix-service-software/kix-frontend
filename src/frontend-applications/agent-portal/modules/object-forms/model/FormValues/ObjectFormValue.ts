/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { DynamicFieldFormValueCountHandler } from './DynamicFields/DynamicFieldFormValueCountHandler';
import { FormValueAction } from './FormValueAction';


export class ObjectFormValue<T = any> {

    public instanceId: string;

    protected bindings: FormValueBinding[] = [];

    public value: T;
    public formValues: ObjectFormValue[] = [];
    public label: string = this.property;
    public hint: string;
    public possibleValues: any[] = null;
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

    public isCountHandler: boolean = false;
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

    public setInitialState(): void {
        this.initialState.set('countDefault', this.countDefault);
        this.initialState.set('countMax', this.countMax);
        this.initialState.set('countMin', this.countMin);
        this.initialState.set('enabled', this.enabled);
        this.initialState.set('hint', this.hint);
        this.initialState.set('isCountHandler', this.isCountHandler);
        this.initialState.set('label', this.label);
        this.initialState.set('possibleValues', Array.isArray(this.possibleValues) ? [...this.possibleValues] : null);
        this.initialState.set('forbiddenValues', Array.isArray(this.forbiddenValues) ? [...this.forbiddenValues] : null);
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

    public async reset(ignoreProperties: string[] = []): Promise<void> {
        let property = this.property;
        if ((this as any).dfName) {
            property = `DynamicFields.${(this as any).dfName}`;
        }

        if (!ignoreProperties.some((p) => p === property)) {
            const iter = this.initialState.keys();
            let key = iter.next();
            while (key?.value) {
                if (this[key.value] !== this.initialState.get(key.value)) {
                    this[key.value] = this.initialState.get(key.value);
                }
                key = iter.next();
            }
        }

        if (this.formValues?.length) {
            for (const fv of this.formValues) {
                await fv.reset(ignoreProperties);
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

            this.addPropertyBinding(FormValueProperty.VALUE, async () => {
                if (this.isCountHandler && !this.value) {
                    if (Array.isArray(this.formValues)) {
                        const formValues = [...this.formValues];
                        for (const formValue of formValues) {
                            await DynamicFieldFormValueCountHandler.removeFormValue(formValue, formValue.instanceId);
                        }
                    }
                    this.initCountValues();
                }
            });

            this.addPropertyBinding(FormValueProperty.REG_EX_LIST, () => {
                if (this.isCountHandler && Array.isArray(this.formValues)) {
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

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        const isEdit = this.objectValueMapper.formContext === FormContext.EDIT;
        if ((!this.value || isEdit) && field.defaultValue?.value && !field.empty) {
            const value = await this.handlePlaceholders(field.defaultValue?.value);
            this.setFormValue(value, true);
        }

        if (field.empty && !this.value) {
            this.setFormValue(null, true);
        }

        this.enabled = true;
        this.visible = field.visible;
        this.readonly = field.readonly;
        this.required = field.required;
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
        this.isSetInBackground =
            this.parent?.isCountHandler && this.parent?.isSetInBackground || this.isSetInBackground;
    }

    protected async handlePlaceholders(value: any): Promise<any> {
        if (value) {

            const placeholderObject = this.objectValueMapper?.sourceObject || this.objectValueMapper?.object;

            if (typeof value === 'string' && PlaceholderService.getInstance().extractPlaceholders(value)) {
                const newValue = await PlaceholderService.getInstance().replacePlaceholders(
                    value, placeholderObject
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

    public async initCountValues(): Promise<void> {
        this.setCountMinDefMax();
        this.isCountHandler = this._isCounterHandler();
        if (!this.isCountHandler) return;

        this.inputComponentId = 'count-handler-form-input';

        if (this.countMin > 0) {
            this.required = true;
        }

        if (!this.value) {
            await this.addDefaultFormValues();
        }

        if (this.value && !Array.isArray(this.value)) {
            this.value = [this.value] as any;
        }

        if (Array.isArray(this.value)) {
            if (this.value.length) {
                for (const v of this.value) {
                    if (this.canAddValue(this.instanceId)) {
                        await this.addFormValue(this.instanceId, v);

                        const formValue = this.formValues[this.formValues.length - 1];
                        if (formValue) {
                            formValue.value = v;
                        }
                    }
                }

                if (this.formValues.length < this.countDefault) {
                    this.addDefaultFormValues();
                }
            } else {
                await this.addDefaultFormValues();
            }
        }
    }

    protected async addDefaultFormValues(): Promise<void> {
        const startIndex = this.formValues?.length || 0;
        for (let i = startIndex; i < this.countDefault; i++) {
            await this.addFormValue(null, null);
        }
    }

    private setCountMinDefMax(): void {
        if (this.countMax > 0 && this.countMin > this.countMax) this.countMin = this.countMax;
        if (this.countMax > 0 && this.countDefault > this.countMax) this.countDefault = this.countMax;
        if (this.countDefault < this.countMin) this.countDefault = this.countMin;
    }

    private _isCounterHandler(): boolean {
        return this.countMin === 0 && this.countMax === 0 ||
            this.countMin === 0 && this.countMax > 0 ||
            this.countMin > 1 || this.countDefault > 1 || this.countMax > 1;
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

    public removeValue(value: any): void {
        this.setFormValue(null);
    }

    public setPossibleValues(values: T[]): void {
        this.possibleValues = Array.isArray(values) ? values : values ? [values] : [];
        this.applyPossibleValues();
    }

    public addPossibleValues(values: T[]): void {
        if (Array.isArray(values)) {
            if (!Array.isArray(this.possibleValues)) {
                this.possibleValues = [];
            }

            for (const pv of values) {
                if (!this.possibleValues?.some((v) => v?.toString() === pv?.toString())) {
                    this.possibleValues.push(pv);
                }
            }
        }
    }

    public removePossibleValues(values: T[]): void {
        if (Array.isArray(this.forbiddenValues)) {
            for (const v of values) {
                if (!this.forbiddenValues.some((fv) => fv.toString() === v.toString())) {
                    this.forbiddenValues.push(v);
                }
            }
        } else {
            this.forbiddenValues = values;
        }

        this.applyPossibleValues();
    }

    public setValidationResult(validationResult: ValidationResult[] = []): void {
        this.valid = !validationResult.some((r) => r.severity === ValidationSeverity.ERROR);
        this.validationResults = validationResult;
    }

    protected applyPossibleValues(): void {
        let value: any = this.value;
        if (this.value && !Array.isArray(this.value)) {
            value = [this.value];
        }

        if (Array.isArray(value) && this.possibleValues) {
            const newValue = [];
            for (const v of value) {
                const isPossible = this.possibleValues?.some((pv) => pv.toString() === v.toString());
                const isForbidden = this.forbiddenValues?.some((pv) => pv.toString() === v.toString());
                if (isPossible && !isForbidden) {
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

    public canAddValue(instanceId: string): boolean {
        return false;
    }

    public async addFormValue(instanceId: string, value: any): Promise<void> {
        await this.setVisibilityAndComponent();
    }

    public canRemoveValue(instanceId: string): boolean {
        return false;
    }

    public async removeFormValue(instanceId: string): Promise<void> {
        await this.setVisibilityAndComponent();
    }

    public async setVisibilityAndComponent(): Promise<void> {
        if (this.isCountHandler) {
            if (this.formValues && this.formValues.length > 0) {
                this.setNewInitialState('visible', false);
                this.visible = false;
            } else {
                this.inputComponentId = 'count-handler-form-input';
                this.setNewInitialState('visible', true);
                this.visible = true;
            }
        } else if (this.parent?.isCountHandler) {
            await this.parent.setVisibilityAndComponent();
        }
    }

    public deleteObjectValue(object: KIXObject): void {
        delete object[this.property];
    }

    protected _countMax(): void {
        if (this.countMax < this.formValues.length) {
            const difference = this.formValues.length - this.countMax;
            for (let i = 0; i < difference; i++) {
                const index = this.formValues.length - 1;
                this.removeFormValue(this.formValues[index].instanceId);
            }
        }
    }

    // For countMin implementation
    /*protected _countMin(): void {
        if (this.countMin > this.formValues.length) {
            const difference = this.countMin - this.formValues.length;
            for (let i = 0; i < difference; i++) {
                this.addFormValue(null);
            }
        }
    }*/

    public getValueActionClasses(): Array<new (
        formValue: ObjectFormValue, objectValueMapper: ObjectFormValueMapper
    ) => FormValueAction> {
        return;
    }

}