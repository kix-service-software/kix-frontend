/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import { FormInputComponent } from "../../../../../modules/base-components/webapp/core/FormInputComponent";
import { TranslationService } from "../../../../../modules/translation/webapp/core/TranslationService";
import { FormFieldOptions } from "../../../../../model/configuration/FormFieldOptions";
import { TreeNode } from "../../../../base-components/webapp/core/tree";
import { DispatchingType } from "../../../model/DispatchingType";
import { ServiceRegistry } from "../../../../../modules/base-components/webapp/core/ServiceRegistry";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { IKIXObjectService } from "../../../../../modules/base-components/webapp/core/IKIXObjectService";

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

        const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(KIXObjectType.TICKET);
        let queueNodes = [];
        if (service) {
            queueNodes = await service.getTreeNodes(
                'QueueID', showInvalid
            );
        }

        this.state.nodes = [
            new TreeNode(DispatchingType.FRONTEND_KEY_DEFAULT, 'Translatable#Default'),
            ...queueNodes
        ];
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
        } else {
            this.state.currentNode = this.findNode(DispatchingType.FRONTEND_KEY_DEFAULT);
        }
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
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


    public nodeChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
