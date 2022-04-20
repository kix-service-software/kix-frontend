/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { TreeHandler, TreeService } from '../../../core/tree';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private treeHandler: TreeHandler;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.treeHandler = TreeService.getInstance().getTreeHandler(input.treeId);
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject(['Translatable#Submit']);
        if (this.treeHandler) {
            this.treeHandler.registerSelectionListener('dropdown-button-bar', () => this.setCheckState());
            this.setCheckState();
        }
    }

    public selectAll(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        const checkBox = (this as any).getEl('selectAllCheckbox');
        if (checkBox && this.treeHandler) {
            if (checkBox.checked) {
                this.treeHandler.selectAll();
            } else {
                this.treeHandler.selectNone();
            }
        }

        setTimeout(() => {
            this.setCheckState();
        }, 50);
    }

    private setCheckState(): void {
        const checkBox = (this as any).getEl('selectAllCheckbox');
        if (checkBox && this.treeHandler) {
            const visibleNodes = this.treeHandler.getVisibleNodes();
            const selectedNodes = this.treeHandler.getSelectedNodes();

            let checked = true;
            let indeterminate = false;
            if (selectedNodes.length === 0) {
                checked = false;
            } else if (selectedNodes.length < visibleNodes.length) {
                checked = false;
                indeterminate = true;
            }
            setTimeout(() => {
                checkBox.checked = checked;
                checkBox.indeterminate = indeterminate;
            }, 10);
        }
    }

    public submit(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        (this as any).emit('submit');
    }

}

module.exports = Component;
