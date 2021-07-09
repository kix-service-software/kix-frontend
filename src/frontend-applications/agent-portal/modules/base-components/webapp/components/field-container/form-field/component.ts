/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { EventService } from '../../../core/EventService';
import { FormEvent } from '../../../core/FormEvent';
import { IEventSubscriber } from '../../../core/IEventSubscriber';
import { LabelService } from '../../../core/LabelService';
import { ContextService } from '../../../core/ContextService';
import { Context } from 'mocha';
import { KIXModulesService } from '../../../core/KIXModulesService';

class Component {

    private state: ComponentState;
    private formSubscriber: IEventSubscriber;

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

        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();

        const value = formInstance?.getFormFieldValue(this.state.field?.instanceId);
        if (value && Array.isArray(value.errorMessages) && value.errorMessages.length) {
            this.state.errorMessages = value.errorMessages;
        } else {
            this.state.errorMessages = [];
        }

        this.state.show = true;

    }

    public async onMount(): Promise<void> {
        this.formSubscriber = {
            eventSubscriberId: this.state.field?.instanceId,
            eventPublished: async (data: any, eventId: string) => {
                if (this.hasChildren()) {
                    this.state.minimized = this.state.minimized && !(await this.hasInvalidChildren());
                }

                const isUpdateEvent = eventId === FormEvent.FIELD_VALIDATED
                    || eventId === FormEvent.FIELD_READONLY_CHANGED;

                if (isUpdateEvent && this.state.field?.instanceId === data?.instanceId) {
                    this.update();
                }
            }
        };

        EventService.getInstance().subscribe(FormEvent.FIELD_CHILDREN_ADDED, this.formSubscriber);
        EventService.getInstance().subscribe(FormEvent.FIELD_VALIDATED, this.formSubscriber);
        EventService.getInstance().subscribe(FormEvent.FIELD_READONLY_CHANGED, this.formSubscriber);
        EventService.getInstance().subscribe(FormEvent.FORM_VALIDATED, this.formSubscriber);
        EventService.getInstance().subscribe(FormEvent.FORM_PAGE_VALIDATED, this.formSubscriber);


        this.update();
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(FormEvent.FIELD_CHILDREN_ADDED, this.formSubscriber);
        EventService.getInstance().subscribe(FormEvent.FIELD_VALIDATED, this.formSubscriber);
        EventService.getInstance().subscribe(FormEvent.FIELD_READONLY_CHANGED, this.formSubscriber);
        EventService.getInstance().unsubscribe(FormEvent.FORM_VALIDATED, this.formSubscriber);
        EventService.getInstance().unsubscribe(FormEvent.FORM_PAGE_VALIDATED, this.formSubscriber);
    }

    private async hasInvalidChildren(field: FormFieldConfiguration = this.state.field): Promise<boolean> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        let hasInvalidChildren = false;
        if (Array.isArray(field.children)) {
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
        event.dataTransfer.setData('Text', this.state.field?.instanceId);
        (this as any).emit('dragStart', this.state.field?.instanceId);
    }

    public async handleDragEnd(event) {
        const root = (this as any).getEl();
        if (root) {
            root.classList.remove('dragging');
        }
        (this as any).emit('dragEnd', this.state.field?.instanceId);
    }
}

module.exports = Component;
