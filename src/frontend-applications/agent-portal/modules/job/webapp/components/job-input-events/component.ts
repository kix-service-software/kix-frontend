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
import { TranslationService } from "../../../../translation/webapp/core";
import { TreeNode } from "../../../../base-components/webapp/core/tree";
import { JobService } from "../../core";
import { JobProperty } from "../../../model/JobProperty";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";

class Component extends FormInputComponent<string[], ComponentState> {

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

    private async load(): Promise<TreeNode[]> {
        const nodes = await JobService.getInstance().getTreeNodes(
            JobProperty.EXEC_PLAN_EVENTS
        );
        this.setCurrentNode(nodes);
        return nodes;
    }

    public setCurrentNode(nodes: TreeNode[]): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            let currentNodes = [];
            if (Array.isArray(this.state.defaultValue.value)) {
                currentNodes = nodes.filter(
                    (eventNode) => this.state.defaultValue.value.some((eventName) => eventName === eventNode.id)
                );
            } else {
                const node = nodes.find(
                    (eventNode) => eventNode.id === this.state.defaultValue.value
                );
                currentNodes = node ? [node] : [];
            }

            currentNodes.forEach((n) => n.selected = true);
            this.provideToContext(currentNodes);
            super.provideValue(currentNodes.map((n) => n.id), true);
        }
    }

    public nodesChanged(nodes: TreeNode[]): void {
        this.provideToContext(nodes);
        super.provideValue(nodes.map((n) => n.id));
    }

    private provideToContext(nodes: TreeNode[]): void {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            context.setAdditionalInformation(
                JobProperty.EXEC_PLAN_EVENTS, nodes.map((n) => n.id)
            );
        }
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
