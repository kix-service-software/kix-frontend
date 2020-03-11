/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { ConfigItemClass } from '../../../model/ConfigItemClass';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { CMDBService } from '../../core';
import { ConfigItemProperty } from '../../../model/ConfigItemProperty';
import { TreeNode } from '../../../../base-components/webapp/core/tree';

class Component extends FormInputComponent<ConfigItemClass, ComponentState> {

    private configItems: ConfigItemClass[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.nodes = await CMDBService.getInstance().getTreeNodes(ConfigItemProperty.CLASS_ID);
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => this.state.defaultValue.value.equals(n.id));
            const configItem = this.state.currentNode ? this.configItems.find(
                (cu) => cu.ID === this.state.currentNode.id
            ) : null;
            super.provideValue(configItem);
        }
    }

    public configItemChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        const configItemClass = this.state.currentNode ? this.state.currentNode.id : null;
        super.provideValue(configItemClass);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
