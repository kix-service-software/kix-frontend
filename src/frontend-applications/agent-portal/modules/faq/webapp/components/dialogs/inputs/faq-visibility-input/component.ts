/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CompontentState } from "./CompontentState";
import { FormInputComponent } from "../../../../../../../modules/base-components/webapp/core/FormInputComponent";
import { FAQVisibility } from "../../../../../model/FAQVisibility";
import { KIXObjectType } from "../../../../../../../model/kix/KIXObjectType";
import { TreeNode } from "../../../../../../base-components/webapp/core/tree";
import { TranslationService } from "../../../../../../../modules/translation/webapp/core/TranslationService";
import { KIXObjectService } from "../../../../../../../modules/base-components/webapp/core/KIXObjectService";

class Component extends FormInputComponent<number, CompontentState> {

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
        const nodes = [];

        const faqVisibilities = await KIXObjectService.loadObjects<FAQVisibility>(KIXObjectType.FAQ_VISIBILITY);
        for (const l of faqVisibilities) {
            const labelText = await TranslationService.translate(l.name);
            nodes.push(new TreeNode(l.id, labelText));
        }

        this.state.nodes = nodes;
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
        }
    }

    public validChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
