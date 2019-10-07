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
    TicketProperty, TreeNode, FormInputComponent, FormFieldOptions, KIXObjectType, TreeHandler, TreeService
} from "../../../../../core/model";
import { TicketService } from "../../../../../core/browser/ticket";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";
import { UIUtil } from "../../../../../core/browser";

class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
        this.state.loadNodes = this.load.bind(this);
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
    }

    public async load(): Promise<TreeNode[]> {
        const validOption = this.state.field.options
            ? this.state.field.options.find((o) => o.option === FormFieldOptions.SHOW_INVALID)
            : null;

        const showInvalid = validOption ? validOption.value : false;

        const queueId = await UIUtil.getEditObjectId(KIXObjectType.QUEUE);
        const nodes = await TicketService.getInstance().getTreeNodes(
            TicketProperty.QUEUE_ID, showInvalid, queueId ? [queueId] : null
        );

        this.setCurrentNode(nodes);
        return nodes;
    }

    public setCurrentNode(nodes: TreeNode[]): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            let node: TreeNode;
            if (Array.isArray(this.state.defaultValue.value)) {
                node = this.findNode(this.state.defaultValue.value[0], nodes);
            } else {
                node = this.findNode(this.state.defaultValue.value, nodes);
            }

            if (node) {
                node.selected = true;
                super.provideValue(node.id);
            }
        }
    }

    private findNode(id: any, nodes: TreeNode[]): TreeNode {
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
        const currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(currentNode ? Number(currentNode.id) : null);
    }
}

module.exports = Component;
