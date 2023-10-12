/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { TreeNode, TreeService, TreeHandler } from '../../../../base-components/webapp/core/tree';
import { JobFormService } from '../../core';
import { JobProperty } from '../../../model/JobProperty';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { AbstractJobFormManager } from '../../core/AbstractJobFormManager';

class Component extends FormInputComponent<string[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field?.placeholder
            ? this.state.field?.placeholder
            : this.state.field?.required ? this.state.field?.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        const treeHandler = new TreeHandler([], null, null, true);
        TreeService.getInstance().registerTreeHandler(this.state.treeId, treeHandler);
        await this.load();
        await super.onMount();

        this.state.prepared = true;
    }

    private async load(): Promise<void> {
        let nodes = [];

        const jobFormManager = await this.getJobFormManager();
        if (jobFormManager) {
            nodes = await jobFormManager.getEventNodes();
        }

        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (treeHandler) {
            treeHandler.setTree(nodes, null, true);
        }
    }

    private async getJobFormManager(): Promise<AbstractJobFormManager> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        if (formInstance) {
            const value = await formInstance.getFormFieldValueByProperty<string>(JobProperty.TYPE);
            if (value && value.value) {
                return JobFormService.getInstance().getJobFormManager(value.value);
            }
        }
        return;
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<string[] | string>(this.state.field?.instanceId);
        if (value) {
            const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
            if (treeHandler) {
                const nodes = treeHandler.getTree();
                let selectedNodes = [];
                if (Array.isArray(value.value)) {
                    selectedNodes = nodes.filter(
                        (eventNode) => (value.value as string[]).some((eventName) => eventName === eventNode.id)
                    );
                } else {
                    const node = nodes.find(
                        (eventNode) => eventNode.id === value.value
                    );
                    selectedNodes = node ? [node] : [];
                }

                selectedNodes.forEach((n) => n.selected = true);

                this.provideToContext(selectedNodes);
                treeHandler.setSelection(selectedNodes, true, true, true);
            }
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
