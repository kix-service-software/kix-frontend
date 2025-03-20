/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { FormValueProperty } from '../../../../../object-forms/model/FormValueProperty';
import { ChannelFormValue } from '../../../core/form/form-values/ChannelFormValue';
import { TreeNode } from '../../../../../base-components/webapp/core/tree';
import { IdService } from '../../../../../../model/IdService';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { ObjectFormEvent } from '../../../../../object-forms/model/ObjectFormEvent';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';

class Component extends AbstractMarkoComponent<ComponentState> {

    private bindingIds: string[];
    private formValue: ChannelFormValue;

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (this.formValue?.instanceId !== input.formValue?.instanceId) {
            this.formValue?.removePropertyBinding(this.bindingIds);
            this.formValue = input.formValue;
            this.update();
        }
    }

    private async update(): Promise<void> {
        this.bindingIds = [];
        this.bindingIds.push(
            this.formValue?.addPropertyBinding(
                'selectedNodes', async (formValue: ChannelFormValue) => {
                    const selectedNodes = await this.formValue.getSelectedTreeNodes();
                    const selectedNode = selectedNodes?.length ? selectedNodes[0] : null;
                    if (selectedNode?.id !== this.state.selectedNode?.id) {
                        this.state.selectedNode = selectedNode;
                    }
                }
            )
        );

        this.bindingIds.push(
            this.formValue?.addPropertyBinding(
                FormValueProperty.POSSIBLE_VALUES, (formValue: ChannelFormValue) => {
                    this.state.nodes = formValue.getSelectableTreeNodeValues();
                }
            )
        );

        this.bindingIds.push(
            this.formValue?.addPropertyBinding(
                FormValueProperty.READ_ONLY, (formValue: ChannelFormValue) => {
                    this.state.readonly = formValue.readonly;
                }
            )
        );

        this.state.noChannel = this.formValue?.noChannelSelectable;
        this.state.readonly = this.formValue?.readonly;

        this.state.nodes = this.formValue?.getSelectableTreeNodeValues();
        const selectedNodes = await this.formValue?.getSelectedTreeNodes();
        this.state.selectedNode = selectedNodes?.length ? selectedNodes[0] : null;
        if (!this.state.selectedNode) {
            this.clearValue();
        }
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#No Article'
        ]);
        this.state.loading = false;

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (data: any, eventId: string): void => {
                if (data.blocked) {
                    this.state.readonly = true;
                } else {
                    this.state.readonly = this.formValue.readonly;
                }
            }
        };
        EventService.getInstance().subscribe(ObjectFormEvent.BLOCK_FORM, this.subscriber);
    }

    public onDestroy(): void {
        this.formValue?.removePropertyBinding(this.bindingIds);
        EventService.getInstance().subscribe(ObjectFormEvent.BLOCK_FORM, this.subscriber);
    }

    public selectChannel(node: TreeNode): void {
        if (node && !this.state.readonly) {
            this.formValue.setFormValue(node.id);
        }
    }

    public clearValue(): void {
        if (!this.state.readonly) {
            this.formValue?.setFormValue(null);
        }
    }

    public keydown(node: TreeNode, event: any): void {
        if (event.code === 'Space' || event.key === 'Enter') {
            event.stopPropagation();
            event.preventDefault();

            if (node) {
                this.selectChannel(node);
            } else {
                this.clearValue();
            }
        }
    }

}

module.exports = Component;
