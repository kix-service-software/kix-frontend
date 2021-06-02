/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

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
        this.setCurrentValue();
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async setCurrentValue(): Promise<void> {
        let nodes = [];
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<number>(this.state.field.instanceId);
        if (value && value.value) {
            if (!isNaN(value.value)) {
                const organisations = await KIXObjectService.loadObjects(
                    KIXObjectType.ORGANISATION, [value.value]
                );

                if (organisations && organisations.length) {
                    const organisation = organisations[0];
                    const displayValue = await LabelService.getInstance().getObjectText(organisation);
                    const currentNode = new TreeNode(organisation.ObjectId, displayValue, 'kix-icon-man-bubble');
                    nodes = [currentNode];
                }
            } else {
                const currentNode = new TreeNode(
                    value.value, value.value.toString(), 'kix-icon-man-bubble'
                );
                nodes = [currentNode];
            }
        }

        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (treeHandler) {
            treeHandler.setTree(nodes);
            treeHandler.setSelection(nodes, true, true);
        }
    }

    public nodesChanged(nodes: TreeNode[]): void {
        const currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(currentNode ? currentNode.id : null);
    }
}

module.exports = Component;
