/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TreeHandler, TreeNode, TreeService } from '../../core/tree';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { FormInputComponent } from '../../core/FormInputComponent';
import { ContextService } from '../../core/ContextService';
import { AgentService } from '../../../../user/webapp/core/AgentService';
import { PersonalSettingsProperty } from '../../../../user/model/PersonalSettingsProperty';
import { PersonalSettingsService } from '../../../../user/model/PersonalSettingsService';

class Component extends FormInputComponent<string | number | string[] | number[], ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount(false);

        this.state.prepared = true;
    }

    protected async prepareMount(): Promise<void> {
        await super.prepareMount();

        const nodes = await PersonalSettingsService.getInitialURLSiteNodes();

        const treeHandler = new TreeHandler(nodes, null, null, false);
        TreeService.getInstance().registerTreeHandler(this.state.treeId, treeHandler);

        const currentUser = await AgentService.getInstance().getCurrentUser();
        const initSiteURLSetting = currentUser.Preferences.find(
            (setting) => setting.ObjectId === PersonalSettingsProperty.INITIAL_SITE_URL
        );
        const initialSelectedNode: TreeNode = nodes.find((node) => node.id === initSiteURLSetting?.Value);
        if (initialSelectedNode) {
            treeHandler.setSelection([initialSelectedNode], true);
        }
    }

    public async setCurrentValue(): Promise<void> {
        const formInstance = await this.context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<string | number | string[] | number[]>(
            this.state.field?.instanceId
        );
        if (value && value.value !== null && typeof value.value !== 'undefined') {
            const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
            if (treeHandler) {
                let selectedNodes = [];
                const nodes = treeHandler.getTree();
                if (Array.isArray(value.value)) {
                    selectedNodes = nodes.filter(
                        (n) => (value.value as Array<string | number>).some(
                            (dv) => dv?.toString() === n.id.toString()
                        )
                    );
                    selectedNodes.forEach((n) => n.selected = true);
                } else {
                    const node = nodes.find((n) => n.id.toString() === value.value.toString());
                    if (node) {
                        node.selected = true;
                        selectedNodes = [node];
                    }
                }
                treeHandler.setSelection(selectedNodes, true, true, true);
            }
        }
    }

    public valueChanged(nodes: TreeNode[]): void {
        super.provideValue(nodes[0]?.id);
    }

    public onDestroy(): void {
        super.onDestroy();
        TreeService.getInstance().removeTreeHandler(this.state.treeId);
    }

}

module.exports = Component;