/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormService, IdService } from '../../../../../core/browser';
import { FormInstance } from '../../../../../core/model';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';
import { KIXModulesService } from '../../../../../core/browser/modules';
import { FormFieldConfiguration } from '../../../../../core/model/components/form/configuration';

class Component {

    private state: ComponentState;
    private formListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
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

    private async update(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject(
            [this.state.field.label, 'Translatable#Sort']
        );
        const hint = await TranslationService.translate(this.state.field.hint);
        this.state.hint = hint
            ? (hint.startsWith('Helptext_') ? null : hint)
            : null;

        this.state.show = true;
    }

    public async onMount(): Promise<void> {
        this.formListenerId = IdService.generateDateBasedId('form-field-' + this.state.field.instanceId);
        await FormService.getInstance().registerFormInstanceListener(this.state.formId, {
            formListenerId: this.formListenerId,
            formValueChanged: () => { return; },
            updateForm: async () => {
                if (this.hasChildren()) {
                    this.state.minimized = this.state.minimized && !(await this.hasInvalidChildren());
                }
            }
        });
        this.update();
    }

    public async onDestroy(): Promise<void> {
        FormService.getInstance().removeFormInstanceListener(this.state.formId, this.formListenerId);
    }

    private async hasInvalidChildren(field: FormFieldConfiguration = this.state.field): Promise<boolean> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        let hasInvalidChildren = false;
        for (const child of field.children) {
            const value = formInstance.getFormFieldValue(child.instanceId);
            if (!value.valid) {
                return true;
            }

            hasInvalidChildren = await this.hasInvalidChildren(child);
        }

        return hasInvalidChildren;
    }

    public getInputComponent(): any {
        const componentId = this.state.field.inputComponent ? this.state.field.inputComponent : 'default-text-input';
        return KIXModulesService.getComponentTemplate(componentId);
    }

    public minimize(): void {
        this.state.minimized = !this.state.minimized;
    }

    public hasChildren(): boolean {
        return this.state.field.children && this.state.field.children.length > 0;
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

        // do nothing if event triggert from child node
        if (event && !event.srcElement.classList.contains('drag-button')) {
            return;
        }

        this.state.draggable = Boolean(draggable).toString();
    }

    public async handleDragStart(event) {
        const root = (this as any).getEl();
        if (root) {
            root.classList.add('dragging');
        }
        event.dataTransfer.setData('Text', this.state.field.instanceId);
        (this as any).emit('dragStart', this.state.field.instanceId);
    }

    public async handleDragEnd(event) {
        const root = (this as any).getEl();
        if (root) {
            root.classList.remove('dragging');
        }
        (this as any).emit('dragEnd', this.state.field.instanceId);
    }
}

module.exports = Component;
