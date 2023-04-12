/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { TreeNode, TreeService } from '../../../../base-components/webapp/core/tree';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { Organisation } from '../../../../customer/model/Organisation';

class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        this.state.placeholder = await TranslationService.translate('Translatable#Please select a contact');
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.setPossibleValue();
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async setPossibleValue(): Promise<void> {
        this.state.loading = true;
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const possibleValues = formInstance?.getPossibleValue(this.state.field?.property);
        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (treeHandler) {
            if (Array.isArray(possibleValues?.value) && possibleValues.value.length && possibleValues.value[0]) {
                if (!isNaN(Number(possibleValues.value[0]))) {
                    const organisations = await KIXObjectService.loadObjects<Organisation>(
                        KIXObjectType.ORGANISATION, possibleValues.value
                    ).catch(() => []);
                    if (organisations?.length) {
                        const nodesPromises = [];
                        organisations.forEach((o) => nodesPromises.push(this.getOrgNode(o)));
                        const nodes = await Promise.all(nodesPromises);
                        treeHandler.setTree(nodes.filter((n) => n), null, true);
                    }
                } else {
                    const icon = LabelService.getInstance().getObjectIconForType(KIXObjectType.ORGANISATION);
                    treeHandler.setTree(
                        [new TreeNode(possibleValues.value[0], possibleValues.value[0], icon)],
                        null, true
                    );
                }
            } else {
                treeHandler.setTree([]);
            }
        }
        this.state.loading = false;
    }

    private async getOrgNode(organisation: Organisation): Promise<TreeNode> {
        if (organisation) {
            const displayValue = await LabelService.getInstance().getObjectText(organisation);
            const displayIcon = await LabelService.getInstance().getObjectIcon(organisation);
            return new TreeNode(organisation.ObjectId, displayValue, displayIcon);
        }
        return;
    }

    public async setCurrentValue(): Promise<void> {
        let nodes = [];
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance?.getFormFieldValue<number>(this.state.field?.instanceId);
        if (value && value.value) {
            if (!isNaN(value.value)) {
                const organisations = await KIXObjectService.loadObjects<Organisation>(
                    KIXObjectType.ORGANISATION, [value.value]
                );
                if (organisations?.length) {
                    const currentNode = await this.getOrgNode(organisations[0]);
                    if (currentNode) {
                        nodes = [currentNode];
                    }
                }
            } else {
                const icon = LabelService.getInstance().getObjectIconForType(KIXObjectType.ORGANISATION);
                const currentNode = new TreeNode(
                    value.value, value.value.toString(), icon
                );
                nodes = [currentNode];
            }
        }

        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (treeHandler) {
            treeHandler.setSelection(nodes, true, true);
        }
    }

    public nodesChanged(nodes: TreeNode[]): void {
        const currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(currentNode ? currentNode.id : null);
    }
}

module.exports = Component;
