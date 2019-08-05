/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import { TreeNode, FormInputComponent, NotificationProperty } from "../../../../../../core/model";
import { TranslationService } from "../../../../../../core/browser/i18n/TranslationService";
import { NotificationService } from "../../../../../../core/browser/notification";

class Component extends FormInputComponent<string[], ComponentState> {

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

        this.state.nodes = await NotificationService.getInstance().getTreeNodes(
            NotificationProperty.DATA_EVENTS
        );
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            if (Array.isArray(this.state.defaultValue.value)) {
                this.state.currentNodes = this.state.nodes.filter(
                    (eventNode) => this.state.defaultValue.value.some((eventName) => eventName === eventNode.id)
                );
            } else {
                const node = this.state.nodes.find(
                    (eventNode) => eventNode.id === this.state.defaultValue.value
                );
                this.state.currentNodes = node ? [node] : [];
            }
            super.provideValue(
                this.state.currentNodes ? this.state.currentNodes.map((n) => n.id) : null
            );
        }
    }
    public eventChanged(nodes: TreeNode[]): void {
        this.state.currentNodes = nodes && nodes.length ? nodes : null;
        super.provideValue(this.state.currentNodes ? this.state.currentNodes.map((n) => n.id) : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
