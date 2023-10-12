/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { ComponentState } from './ComponentState';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AutoCompleteConfiguration } from '../../../../../model/configuration/AutoCompleteConfiguration';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { SystemAddress } from '../../../../system-address/model/SystemAddress';
import { Contact } from '../../../../customer/model/Contact';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { ContactProperty } from '../../../../customer/model/ContactProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { ContactService } from '../../../../customer/webapp/core/ContactService';

class Component extends FormInputComponent<string[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
        this.state.loadNodes = this.getCurrentNodes.bind(this);
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.searchCallback = this.searchContacts.bind(this);
        const objectName = await LabelService.getInstance().getObjectName(KIXObjectType.CONTACT, true, false);
        this.state.autoCompleteConfiguration = new AutoCompleteConfiguration(10, 2000, 3, objectName);
    }

    public async setCurrentValue(): Promise<void> {
        return;
    }

    public async getCurrentNodes(): Promise<TreeNode[]> {
        const nodes = [];
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const defaultValue = formInstance ? formInstance.getFormFieldValue<string>(this.state.field?.instanceId) : null;
        if (defaultValue && defaultValue.value) {
            const contactEmails: string[] = Array.isArray(defaultValue.value)
                ? defaultValue.value
                : (defaultValue.value as string).split(',').map((v) => v.trim());

            const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(
                KIXObjectType.SYSTEM_ADDRESS
            );
            // TODO: nicht sehr performant
            for (const email of contactEmails) {
                const plainMail = email.replace(/.+ <(.+)>/, '$1');
                const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, null,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                ContactProperty.EMAIL, SearchOperator.EQUALS, FilterDataType.STRING,
                                FilterType.OR, plainMail
                            )
                        ]

                    ), null, true
                );
                let node: TreeNode;
                if (contacts && !!contacts.length) {
                    node = await this.createTreeNode(contacts[0]);
                } else if (!systemAddresses?.map((sa) => sa.Name).some((f) => f === plainMail)) {
                    node = new TreeNode(plainMail, email);
                }
                node.selected = true;
                nodes.push(node);
            }
        }
        return nodes;
    }

    public emailChanged(nodes: TreeNode[]): void {
        const emailNodes = nodes && !!nodes.length ? nodes : [];
        super.provideValue(emailNodes.map((n) => n.id));
    }

    private async searchContacts(limit: number, searchValue: string): Promise<TreeNode[]> {
        const filter = await ContactService.getInstance().prepareFullTextFilter(searchValue);
        const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
        const contacts = await KIXObjectService.loadObjects<Contact>(
            KIXObjectType.CONTACT, null, loadingOptions, null, false
        );

        const nodes = [];
        if (searchValue && searchValue !== '') {
            for (const c of contacts.filter((co) => co.Email)) {
                const node = await this.createTreeNode(c);
                nodes.push(node);
            }
        }

        return nodes;
    }

    private async createTreeNode(contact: Contact): Promise<TreeNode> {
        const displayValue = await LabelService.getInstance().getObjectText(contact);
        return new TreeNode(
            contact.Email, displayValue, 'kix-icon-man-bubble', null, null, null,
            null, null, null, null, undefined, undefined, undefined,
            `"${contact.Firstname} ${contact.Lastname}" <${contact.Email}>`
        );
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
