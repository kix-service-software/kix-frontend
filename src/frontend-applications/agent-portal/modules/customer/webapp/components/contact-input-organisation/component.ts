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
import { Organisation } from "../../../model/Organisation";
import { TranslationService } from "../../../../../modules/translation/webapp/core/TranslationService";
import { FormService } from "../../../../../modules/base-components/webapp/core/FormService";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { TreeNode } from "../../../../base-components/webapp/core/tree";
import { OrganisationService } from "../../core";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { LabelService } from "../../../../../modules/base-components/webapp/core/LabelService";

class Component extends FormInputComponent<number, ComponentState> {

    private organisations: Organisation[];

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
        this.state.searchCallback = this.searchOrganisations.bind(this);
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();
        this.setCurrentNode();
    }

    public async setCurrentNode(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const organisations = await KIXObjectService.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, [this.state.defaultValue.value]
            );

            if (organisations && organisations.length) {
                const organisation = organisations[0];
                this.state.currentNode = await this.createTreeNode(organisation);
                this.state.nodes = [this.state.currentNode];
                super.provideValue(organisation.ID);
            }
        }
    }

    public organisationChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    private async searchOrganisations(limit: number, searchValue: string): Promise<TreeNode[]> {
        const filter = await OrganisationService.getInstance().prepareFullTextFilter(searchValue);
        const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
        this.organisations = await KIXObjectService.loadObjects<Organisation>(
            KIXObjectType.ORGANISATION, null, loadingOptions, null, false
        );

        this.state.nodes = [];
        if (searchValue && searchValue !== '') {
            const nodes = [];
            for (const c of this.organisations) {
                const node = await this.createTreeNode(c);
                nodes.push(node);
            }
            this.state.nodes = nodes;
        }

        return this.state.nodes;
    }

    private async createTreeNode(organisation: Organisation): Promise<TreeNode> {
        const displayValue = await LabelService.getInstance().getText(organisation);
        return new TreeNode(organisation.ID, displayValue, 'kix-icon-man-house');
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
