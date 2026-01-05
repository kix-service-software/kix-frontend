/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { FormService } from '../../../../../../modules/base-components/webapp/core/FormService';
import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { FormEvent } from '../../../core/FormEvent';
import { LabelService } from '../../../core/LabelService';
import { KIXModulesService } from '../../../core/KIXModulesService';
import { AbstractMarkoComponent } from '../../../core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input, 'field-container/form-field');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.field = input.field;

        this.state.formId = input.formId;
        this.state.level = typeof input.level !== 'undefined' ? input.level : 0;
        if (this.state.level > 14) {
            this.state.level = 14;
        }
        this.state.canDraggable = typeof input.draggable !== 'undefined'
            ? input.draggable : this.state.canDraggable;

        this.update();
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    private async update(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject(
            ['Translatable#Sort']
        );

        if (this.state.field?.property === this.state.field?.label) {
            const form = await FormService.getInstance().getForm(this.state.formId);
            this.state.label = await LabelService.getInstance().getPropertyText(
                this.state.field?.property, form.objectType, null, this.state.field?.translateLabel
            );
        } else {
            this.state.label = await TranslationService.translate(
                this.state.field?.label, undefined, undefined, !this.state.field?.translateLabel
            );
        }

        const hint = await TranslationService.translate(this.state.field?.hint);
        this.state.hint = hint
            ? (hint.startsWith('Helptext_') ? null : hint)
            : null;

        if (this.state.hint) {
            // keep line breaks
            this.state.hint = this.state.hint.replace(/\\n/g, '\n');
        }

        const formInstance = await this.context?.getFormManager()?.getFormInstance();

        const value = formInstance?.getFormFieldValue(this.state.field?.instanceId);
        this.state.errorMessages = value?.errorMessages || [];

        this.state.show = true;

    }

    public async onMount(): Promise<void> {
        await super.onMount();
        super.registerEventSubscriber(
            async function (data: any, eventId: string): Promise<void> {
                if (this.hasChildren()) {
                    this.state.minimized = this.state.minimized && !(await this.hasInvalidChildren());
                }

                const isUpdateEvent = eventId === FormEvent.FIELD_VALIDATED
                    || eventId === FormEvent.FIELD_READONLY_CHANGED;

                if (isUpdateEvent && this.state.field?.instanceId === data?.instanceId) {
                    this.update();
                }
            },
            [
                FormEvent.FIELD_CHILDREN_ADDED,
                FormEvent.FIELD_VALIDATED,
                FormEvent.FIELD_READONLY_CHANGED,
                FormEvent.FORM_VALIDATED,
                FormEvent.FORM_PAGE_VALIDATED
            ]
        );

        this.update();
    }

    private async hasInvalidChildren(field: FormFieldConfiguration = this.state.field): Promise<boolean> {
        const formInstance = await this.context?.getFormManager()?.getFormInstance(false);
        let hasInvalidChildren = false;
        if (formInstance && Array.isArray(field.children)) {
            for (const child of field.children) {
                const value = formInstance.getFormFieldValue(child.instanceId);
                if (value && !value.valid) {
                    return true;
                }

                hasInvalidChildren = await this.hasInvalidChildren(child);
            }
        }

        return hasInvalidChildren;
    }

    public getInputComponent(): any {
        const componentId = this.state.field?.inputComponent ? this.state.field?.inputComponent : 'default-text-input';
        return KIXModulesService.getComponentTemplate(componentId);
    }

    public minimize(): void {
        this.state.minimized = !this.state.minimized;
    }

    public hasChildren(): boolean {
        return this.state.field?.children && this.state.field?.children.length > 0;
    }

    public getPaddingLeft(): string {
        return (this.state.level * 2) + 'rem';
    }

    public getPaddingRight(): string {
        if (this.state.level > 1) {
            return '1.75rem';
        } else {
            return '0';
        }
    }

    public setDraggable(draggable: boolean = false, event?: any): void {
        event.stopPropagation();
        event.preventDefault();

        // do nothing if event triggert from child node
        if (event && !event.srcElement.classList.contains('drag-button')) {
            return;
        }

        this.state.draggable = Boolean(draggable).toString();
    }

    public handleDragStart(event): void {
        event.stopPropagation();

        const root = (this as any).getEl();
        if (root) {
            root.classList.add('dragging');
        }
        event.dataTransfer.setData('Text', this.state.field?.instanceId);
        (this as any).emit('dragStart', this.state.field?.instanceId);
    }

    public handleDragEnd(event): void {
        event.stopPropagation();

        const root = (this as any).getEl();
        if (root) {
            root.classList.remove('dragging');
        }
        (this as any).emit('dragEnd', this.state.field?.instanceId);
    }
}

module.exports = Component;
