/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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

export class RecipientFormValue extends SelectObjectFormValue {

    public constructor(public property: string,
        object: any,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, object, objectValueMapper, parent);
        this.maxSelectCount = -1;
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();

        this.freeText = true;
        this.objectType = KIXObjectType.CONTACT;
        this.isAutoComplete = true;
        this.multiselect = true;

        const objectName = await LabelService.getInstance().getObjectName(KIXObjectType.CONTACT, true, false);
        this.autoCompleteConfiguration = new AutoCompleteConfiguration(undefined, undefined, undefined, objectName);

        this.loadingOptions = new KIXObjectLoadingOptions(null, null, 10);
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
            const contactValues: any[] = Array.isArray(this.value)
                ? this.value.filter((v) => v !== null && typeof v !== 'undefined')
                : typeof this.value === 'string' ? (this.value as string).split(/\s?,\s/) : [];

            let emailAddresses = [];
            const contactIds = [];
            const placeholders = [];
            for (let value of contactValues) {
                value = value.replace(/^(.*?),$/, '$1');

                if (value.match(/(<|&lt;)KIX_/)) {
                    placeholders.push(value);
                } else if (isNaN(value)) {
                    emailAddresses = this.parseAddresses(value);
                } else if (value !== null && value !== '') {
                    contactIds.push(Number(value));
                }
            }

            if (contactIds?.length) {
                const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, contactIds);
                selectedNodes = await this.getContactNodes(contacts);
            }

            if (emailAddresses?.length) {
                selectedNodes = await this.addEmailAddressNodes(emailAddresses, selectedNodes);
            }

            const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(
                KIXObjectType.SYSTEM_ADDRESS
            );

            const filteredSystemNodes = selectedNodes.filter((n) => !systemAddresses.some((sa) => sa.Name === n.id));
            const placeholderNodes = placeholders.map((n) => new TreeNode(n, n, 'kix-icon-man-bubble'));
            selectedNodes = [...filteredSystemNodes, ...placeholderNodes];

            this.treeHandler.setSelection(selectedNodes, true, true);
        } else {
            this.treeHandler?.selectNone(true);
        }

        this.selectedNodes = selectedNodes;
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
            console.error(error);
        }
        return emailAddresses;
    }

    private async addEmailAddressNodes(emailAddresses: any[], nodes: TreeNode[]): Promise<TreeNode[]> {
        const searchMailAddresses = emailAddresses.map((v) => v.replace(/.+ <(.+)>/, '$1'));
        const mailContacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, null,
            new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(
                        'Email', SearchOperator.IN, FilterDataType.STRING,
                        FilterType.OR, searchMailAddresses
                    )
                ]

            ), null, true
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

}