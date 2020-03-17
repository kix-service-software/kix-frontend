/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponent } from "../../../../../modules/base-components/webapp/core/FormInputComponent";
import { GeneralCatalogItem } from "../../../../general-catalog/model/GeneralCatalogItem";
import { CompontentState } from "./CompontentState";
import { TranslationService } from "../../../../../modules/translation/webapp/core/TranslationService";
import { GeneralCatalogService } from "../../../../general-catalog/webapp/core";
import { GeneralCatalogItemProperty } from "../../../../general-catalog/model/GeneralCatalogItemProperty";
import { TreeNode } from "../../../../base-components/webapp/core/tree";

class Component extends FormInputComponent<GeneralCatalogItem, CompontentState> {

    public onCreate(): void {
        this.state = new CompontentState();
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

        const typeNodes = await GeneralCatalogService.getInstance().getTreeNodes(GeneralCatalogItemProperty.CLASS);
        this.state.nodes = typeNodes;

        this.setCurrentNode();

    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
        }
    }

    public valueChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
