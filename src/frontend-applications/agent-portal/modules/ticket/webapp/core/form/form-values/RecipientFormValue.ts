/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration } from '../../../../../../model/configuration/AutoCompleteConfiguration';
import { DataType } from '../../../../../../model/DataType';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { SortUtil } from '../../../../../../model/SortUtil';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../../../base-components/webapp/core/LabelService';
import { TreeNode, TreeUtil } from '../../../../../base-components/webapp/core/tree';
import { Contact } from '../../../../../customer/model/Contact';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { SystemAddress } from '../../../../../system-address/model/SystemAddress';
import addrparser from 'address-rfc2822';
import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { FormContext } from '../../../../../../model/configuration/FormContext';
import { ArticleProperty } from '../../../../model/ArticleProperty';

export class RecipientFormValue extends SelectObjectFormValue<any> {

    public constructor(public property: string,
        object: any,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, object, objectValueMapper, parent);
        this.maxSelectCount = -1;
        this.freeText = true;
        this.objectType = KIXObjectType.CONTACT;
        this.isAutoComplete = true;
        this.multiselect = true;
        this.autoCompleteConfiguration = new AutoCompleteConfiguration(undefined, undefined, undefined, 'Contact');
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();

        const objectName = await LabelService.getInstance().getObjectName(KIXObjectType.CONTACT, true, false);
        this.autoCompleteConfiguration = new AutoCompleteConfiguration(undefined, undefined, undefined, objectName);

        this.loadingOptions = new KIXObjectLoadingOptions(null, null, 10);
    }

    protected async handlePlaceholders(value: any): Promise<any> {
        value = await super.handlePlaceholders(value);

        if (value) {
            const emailValues: [Contact[], string[], string[]] = await this.getEmailValues(value);

            const emails = [...emailValues[0].map((c) => c.Email), ...emailValues[1]];
            const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(
                KIXObjectType.SYSTEM_ADDRESS
            );

            // remove system addresses (maybe prior From value by placeholder)
            value = emails.filter((email) => !systemAddresses.some((sa) => sa.Name === email));
        }

        return value;
    }

    protected async prepareSelectableNodes(objects: Contact[]): Promise<void> {
        const nodes: TreeNode[] = await this.getContactNodes(objects);

        SortUtil.sortObjects(nodes, 'label', DataType.STRING);

        if (Array.isArray(this.value)) {
            for (const v of this.value) {
                const node = TreeUtil.findNode(nodes, v);
                if (node) {
                    node.selected = true;
                }
            }
        }

        this.treeHandler?.setTree(nodes, undefined, false, true);
    }


    public async loadSelectedValues(): Promise<void> {
        let selectedNodes: TreeNode[] = [];
        const valueDefined = typeof this.value !== 'undefined' && this.value !== null;

        if (valueDefined && this.treeHandler) {
            const emailValues: [Contact[], string[], string[]] = await this.getEmailValues(this.value);

            if (emailValues[0]) {
                selectedNodes = await this.getContactNodes(emailValues[0]);
            }

            if (emailValues[1]) {
                selectedNodes = await this.addEmailAddressNodes(emailValues[1], selectedNodes);
            }

            const placeholderNodes = emailValues[2].map((n) => new TreeNode(n, n, 'kix-icon-man-bubble'));
            selectedNodes = [...selectedNodes, ...placeholderNodes];

            this.value = selectedNodes.map((n) => n.id);
            this.treeHandler.setSelection(selectedNodes, true, true);
        } else {
            this.treeHandler?.selectNone(true);
        }

        this.selectedNodes = selectedNodes;
    }

    protected async searchObjects(): Promise<Contact[]> {
        const contacts = await super.searchObjects();
        return contacts.filter((c) => c.ValidID === 1);
    }

    private async getEmailValues(value): Promise<[Contact[], string[], string[]]> {
        const contactValues: any[] = Array.isArray(value)
            ? value.filter((v) => v !== null && typeof v !== 'undefined')
            : typeof value === 'string' ? (value as string).split(/\s?,\s/) : [];

        const emailAddresses: string[] = [];
        const contactIds: number[] = [];
        const placeholders: string[] = [];
        for (let value of contactValues) {
            value = value.replace(/^(.*?),$/, '$1');

            if (value.match(/(<|&lt;)KIX_/)) {
                placeholders.push(value);
            } else if (isNaN(value)) {
                emailAddresses.push(...this.parseAddresses(value));
            } else if (value !== null && value !== '') {
                contactIds.push(Number(value));
            }
        }

        let contacts: Contact[] = [];
        if (contactIds?.length) {
            contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, contactIds);
        }

        return [contacts, emailAddresses, placeholders];
    }

    private parseAddresses(value: string): string[] {
        const emailAddresses = [];
        try {
            const parseResult = addrparser.parse(value);
            for (const address of parseResult) {
                if (address.phrase && address.phrase !== address.address) {
                    emailAddresses.push(`"${address.phrase}" <${address.address}>`);
                } else {
                    emailAddresses.push(address.address);
                }
            }
        } catch (error) {
            emailAddresses.push(value);
        }
        return emailAddresses;
    }

    private async addEmailAddressNodes(emailAddresses: any[], nodes: TreeNode[]): Promise<TreeNode[]> {
        const searchMailAddresses = emailAddresses.map((v) => v.replace(/.+ <(.+)>/, '$1'));
        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    'Email', SearchOperator.IN, FilterDataType.STRING,
                    FilterType.OR, searchMailAddresses
                )
            ]
        );
        loadingOptions.limit = 1;
        loadingOptions.searchLimit = 1;

        const mailContacts = await KIXObjectService.loadObjects<Contact>(
            KIXObjectType.CONTACT, null, loadingOptions, null, true
        );

        const mailNodes = await this.getContactNodes(mailContacts);

        const unknownMailAddressNodes = emailAddresses.map((ma) => {
            const id = ma.replace(/.+ <(.+)>/, '$1');
            return new TreeNode(id, ma, 'kix-icon-man-bubble');
        });

        return [
            ...nodes,
            ...mailNodes.filter((mn) => !nodes.some((n) => n.id === mn.id)),
            ...unknownMailAddressNodes.filter(
                (umn) => !nodes.some((n) => n.id === umn.id) && !mailNodes.some((mn) => mn.id === umn.id)
            )
        ];
    }

    private async getContactNodes(contacts: Contact[]): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];
        if (contacts && !!contacts.length) {
            for (const o of contacts) {
                const label = await LabelService.getInstance().getObjectText(o, null, null, false);
                const icon = LabelService.getInstance().getObjectIcon(o);
                nodes.push(new TreeNode(o.Email, label, icon, null, null, null,
                    null, null, null, null, undefined, undefined, undefined,
                    `"${o.Firstname} ${o.Lastname}" <${o.Email}>`
                ));
            }
        }
        return nodes;
    }

    public async setObjectValue(value: any): Promise<void> {
        let recipientValue = value;

        if (Array.isArray(value)) {
            const mailAddresses: string[] = [];
            for (const v of value) {
                if (typeof v === 'string') {
                    mailAddresses.push(v);
                } else {
                    // try to solve contact id
                    const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, [v]);
                    if (contacts.length) {
                        mailAddresses.push(contacts[0].Email);
                    }
                }
            }
            recipientValue = mailAddresses.join(',');
        }

        await super.setObjectValue(recipientValue);
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        const isEdit = this.objectValueMapper.formContext === FormContext.EDIT;
        if ((!this.value || isEdit) && field.defaultValue?.value && !field.empty) {
            const value = await this.handlePlaceholders(field.defaultValue?.value);
            this.setFormValue(value);
        }

        if (field.empty) {
            this.setFormValue(null);
        }

        // enable TO if "active" in template for new context
        if (!isEdit && this.property === ArticleProperty.TO) {
            this.enabled = true;
        }
    }

}