/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import {
    TicketProperty, TreeNode, FormInputComponent, FormFieldOptions, KIXObjectType
} from "../../../../../core/model";
import { TicketService } from "../../../../../core/browser/ticket";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";
import { UIUtil } from "../../../../../core/browser";

class Component extends FormInputComponent<number, ComponentState> {

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
        const validOption = this.state.field.options
            ? this.state.field.options.find((o) => o.option === FormFieldOptions.SHOW_INVALID)
            : null;

        const showInvalid = validOption ? validOption.value : false;

        const queueId = await UIUtil.getEditObjectId(KIXObjectType.QUEUE);
        this.state.nodes = await TicketService.getInstance().getTreeNodes(
            TicketProperty.QUEUE_ID, showInvalid, queueId ? [queueId] : null
        );
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            let node;
            if (Array.isArray(this.state.defaultValue.value)) {
                node = this.findNode(this.state.defaultValue.value[0]);
            } else {
                node = this.findNode(this.state.defaultValue.value);
            }
            this.state.currentNode = node;
            super.provideValue(
                this.state.currentNode ? Number(this.state.currentNode.id) : null
            );
        }
    }

    private findNode(id: any, nodes: TreeNode[] = this.state.nodes): TreeNode {
        let returnNode: TreeNode;
        if (Array.isArray(nodes)) {
            returnNode = nodes.find((n) => n.id === id);
            if (!returnNode) {
                for (const node of nodes) {
                    if (node.children && Array.isArray(node.children)) {
                        returnNode = this.findNode(id, node.children);
                        if (returnNode) {
                            break;
                        }
                    }
                }
            }
        }
        return returnNode;
    }

    public queueChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
