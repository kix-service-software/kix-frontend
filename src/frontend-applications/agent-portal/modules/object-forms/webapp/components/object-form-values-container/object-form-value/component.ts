/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from '../../../../../../model/configuration/ConfigurationType';
import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { FormGroupConfiguration } from '../../../../../../model/configuration/FormGroupConfiguration';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { BrowserUtil } from '../../../../../base-components/webapp/core/BrowserUtil';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { KIXModulesService } from '../../../../../base-components/webapp/core/KIXModulesService';
import { ValidationSeverity } from '../../../../../base-components/webapp/core/ValidationSeverity';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { FormConfigurationObject } from '../../../../model/FormConfigurationObject';
import { FormValueProperty } from '../../../../model/FormValueProperty';
import { DynamicFieldCountableFormValue } from '../../../../model/FormValues/DynamicFields/DynamicFieldCountableFormValue';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { ObjectFormEvent } from '../../../../model/ObjectFormEvent';
import { ObjectFormEventData } from '../../../../model/ObjectFormEventData';
import { FieldLayout } from '../../../../model/layout/FieldLayout';
import { ObjectFormConfigurationContext } from '../../../core/ObjectFormConfigurationContext';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private fieldLayout: FieldLayout[];
    private field: FormFieldConfiguration;

    private parent: ObjectFormValue;

    public onCreate(input: any): void {
        super.onCreate(input, 'object-form-values-container/object-form-value');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.parent = input.parent;
        this.fieldLayout = input.fieldLayout;

        const isConfigContext = this.context?.contextId === ObjectFormConfigurationContext.CONTEXT_ID;
        if (this.state.formValue?.instanceId !== input.formValue?.instanceId || isConfigContext) {
            this.state.formValue?.removePropertyBinding(this.bindingIds);

            this.state.formValue = input.formValue;

            if (input.contextInstanceId && this.state.formValue) {
                this.state.formValue.readonly = false;
            }

            this.update();

            if (this.state.formValue) {
                this.state.isEmpty = this.state.formValue.empty || this.state.formValue['isEmpty'];
            }
            if (this.state.formValue?.inputComponentId) {
                this.state.inputTemplate = KIXModulesService.getComponentTemplate(
                    this.state.formValue?.inputComponentId
                );
            }
        } else {
            const controlComponent = (this as any).getComponent(`control-${input.formValue?.instanceId}`);
            if (controlComponent) {
                controlComponent.prepareControls();
            }
        }
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Edit Field'
        ]);
        super.registerEventSubscriber(
            function (data: ObjectFormEventData): void {
                if (this.state.formValue?.instanceId === data?.formValueInstanceId) {
                    const element = (this as any).getEl();
                    if (element) {
                        BrowserUtil.scrollIntoViewIfNeeded(element);
                    }
                }
            },
            [ObjectFormEvent.SCROLL_TO_FORM_VALUE]
        );
    }

    public onDestroy(): void {
        super.onDestroy();
        this.state.formValue?.removePropertyBinding(this.bindingIds);
    }

    private async update(): Promise<void> {
        this.addBindings();

        this.state.enabled = this.state.formValue?.enabled;
        this.state.visible = this.state.formValue?.visible;
        this.state.valid = this.state.formValue?.valid;
        this.state.readonly = this.state.formValue?.readonly;
        this.state.required = this.state.formValue?.required;
        this.state.hint = this.state.formValue?.hint;
        this.state.formValues = this.state.formValue?.formValues?.filter(
            (fv) => fv.isControlledByParent || !fv.fieldId
        );
        this.state.label = await TranslationService.translate(this.state.formValue?.label);

        this.state.validationErrors = this.state.formValue?.validationResults.filter(
            (vr) => vr.severity === ValidationSeverity.ERROR
        );

        const formHandler = await this.context.getFormManager()?.getObjectFormHandler();
        this.field = formHandler.getFormField(this.state.formValue?.fieldId);
        this.state.showVisibilityBadge = this.field ? this.field.options?.find(
            (option) => option.option === 'set hidden')?.value : !this.state.visible;
        this.state.configReadOnly = this.field ?
            this.field.readonly :
            this.state.formValue?.isControlledByParent ?
                this.state.formValue?.parent?.formField?.readonly :
                this.state.formValue?.formField?.readonly;

        this.setDisplayNone();

        this.state.prepared = true;
    }

    private addBindings(): void {
        this.bindingIds = [];

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.FORM_VALUES, (formValue: ObjectFormValue) => {
                    this.state.formValues = [...formValue.formValues];
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.VALID, (formValue: ObjectFormValue) => {
                    this.state.valid = formValue.valid;
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.VALIDATION_RESULTS, (formValue: ObjectFormValue) => {
                    this.state.validationErrors = formValue.validationResults.filter(
                        (vr) => vr.severity === ValidationSeverity.ERROR
                    );
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.READ_ONLY, (formValue: ObjectFormValue) => {
                    this.state.readonly = formValue.readonly;
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.REQUIRED, (formValue: ObjectFormValue) => {
                    this.state.required = formValue.required;
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.VISIBLE, (formValue: ObjectFormValue) => {
                    this.state.visible = formValue.visible;
                    this.setDisplayNone();
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.ENABLED, (formValue: ObjectFormValue) => {
                    this.state.enabled = formValue.enabled;
                    this.setDisplayNone();
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.IS_CONFIGURABLE, (formValue: ObjectFormValue) => {
                    this.setDisplayNone();
                }
            )
        );

        this.bindingIds.push(
            this.state.formValue?.addPropertyBinding(
                FormValueProperty.LABEL, (formValue: ObjectFormValue) => {
                    this.state.label = formValue.label;
                }
            )
        );
    }

    private setDisplayNone(): void {
        const formValue = this.state.formValue;
        if (formValue) {

            let canShow = false;

            const isConfigContext = this.context.contextId === ObjectFormConfigurationContext.CONTEXT_ID;
            // in configuration context
            if (isConfigContext) {
                let hasField = true;
                if (formValue['IS_COUNTABLE'] === true && !formValue['COUNT_CONTAINER']) {
                    hasField = formValue?.parent?.fieldId !== undefined;
                } else {
                    hasField = !!formValue.fieldId;
                }
                canShow = isConfigContext && hasField;

                if (formValue['COUNT_CONTAINER']) {
                    canShow = formValue.formValues.length === 0 && hasField;
                }

                canShow = canShow && formValue.isConfigurable;
            } else {
                const isVisible = BrowserUtil.isBooleanTrue(formValue?.visible?.toString());
                canShow = formValue?.enabled && isVisible;
            }

            this.state.displayNone = !canShow;
        }
    }

    public async editField(): Promise<void> {
        const configObject = new FormConfigurationObject();
        configObject.configurationType = ConfigurationType.FormField;

        if (this.state.formValue.fieldId) {
            configObject.fieldId = this.state.formValue.fieldId;
            EventService.getInstance().publish(ObjectFormEvent.EDIT_FIELD, configObject);
        } else {
            if ((this.state.formValue.parent as DynamicFieldCountableFormValue)?.COUNT_CONTAINER) {
                configObject.fieldId = this.state.formValue.parent.fieldId;
            }
            configObject.fieldProperty = this.state.formValue.property;

            const formHandler = await this.context?.getFormManager().getObjectFormHandler();

            // try to find the group of a configured parent field
            let group: FormGroupConfiguration;
            let field = this.state.formValue?.parent;
            while (!group && field) {
                group = formHandler?.getGroupForField(field?.fieldId);
                field = field.parent;
            }

            configObject.groupId = group?.id;
            EventService.getInstance().publish(ObjectFormEvent.ADD_FIELD, configObject);
        }
    }

    public getFieldClasses(): string {
        const classes = [];

        const fieldLayout = this.fieldLayout?.find((fl) => fl.fieldId === this.field?.id);

        if (fieldLayout?.colSM > 0) {
            classes.push('col-sm-' + (fieldLayout.colSM < 3 ? 3 : fieldLayout.colSM));
        }

        if (fieldLayout?.colMD > 0) {
            classes.push('col-md-' + (fieldLayout.colMD < 3 ? 3 : fieldLayout.colMD));
        }

        if (fieldLayout?.colLG > 0) {
            classes.push('col-lg-' + (fieldLayout.colLG < 3 ? 3 : fieldLayout.colLG));
        }

        if (!classes.length) {
            classes.push('col-12');
        }

        return classes.join(' ');
    }

}

module.exports = Component;