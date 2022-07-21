/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DataType } from '../../../../../../model/DataType';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { SortUtil } from '../../../../../../model/SortUtil';
import { ObjectReferenceUtil } from '../../../../../base-components/webapp/components/object-reference-input/ObjectReferenceUtil';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { TreeNode } from '../../../../../base-components/webapp/core/tree';
import { Contact } from '../../../../../customer/model/Contact';
import { Organisation } from '../../../../../customer/model/Organisation';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { Ticket } from '../../../../model/Ticket';
import { TicketProperty } from '../../../../model/TicketProperty';

export class OrganisationObjectFormValue extends SelectObjectFormValue<number | string> {

    objectBindingId: string;

    public constructor(
        property: string,
        ticket: Ticket,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, ticket, objectValueMapper, parent);

        this.objectType = KIXObjectType.ORGANISATION;
        this.isAutoComplete = false;
        this.hasFilter = false;
        this.multiselect = false;
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();
        this.objectBindingId = this.objectValueMapper?.object?.
            addBinding(TicketProperty.CONTACT_ID, async (value: number) => {
                await this.loadSelectableValues();
                await this.setOrganisationValue(value);
                this.objectValueMapper?.validateFormValue(this, true);
            });

        await this.setOrganisationValue();
    }

    public destroy(): void {
        if (this.objectBindingId?.length && this.objectValueMapper?.object) {
            this.objectValueMapper.object.removeBindings([this.objectBindingId]);
        }
        super.destroy();
    }

    public async loadSelectableValues(): Promise<void> {
        const contactValue = this.objectValueMapper.findFormValue(TicketProperty.CONTACT_ID);
        if (contactValue?.value) {
            const contactId = Array.isArray(contactValue?.value) ? contactValue?.value[0] : contactValue?.value;
            if (!isNaN(Number(contactId))) {
                const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, [contactId])
                    .catch((): Contact[] => []);
                if (contacts.length) {
                    const contact = contacts[0];

                    const organisations = await KIXObjectService.loadObjects<Organisation>(
                        KIXObjectType.ORGANISATION, contact.OrganisationIDs
                    );

                    const promises = [];
                    for (const o of organisations) {
                        promises.push(ObjectReferenceUtil.createTreeNode(
                            o, this.showInvalidNodes, this.isInvalidClickable, this.useTextAsId, this.translatable
                        ));
                    }

                    const nodes = (await Promise.all<TreeNode>(promises)).filter((n) => n instanceof TreeNode);

                    SortUtil.sortObjects(nodes, 'label', DataType.STRING);

                    this.possibleValues = contact.OrganisationIDs;
                    this.treeHandler.setTree(nodes);
                }
            } else if (typeof contactId === 'string') {
                const node = new TreeNode(contactId, contactId.toString());
                this.possibleValues = [contactId];
                this.treeHandler.setTree([node]);
            } else {
                this.clearPossibleValuesAndNodes();
            }
        } else {
            this.clearPossibleValuesAndNodes();
        }
    }

    private async setOrganisationValue(contactId?: number): Promise<void> {
        let organisationId: number | string = null;

        if (!contactId) {
            const contactFormValue = this.objectValueMapper?.findFormValue(TicketProperty.CONTACT_ID);
            contactId = contactFormValue?.value;
        }
        if (Array.isArray(contactId)) {
            contactId = contactId[0];
        }

        if (!contactId) {
            this.clearPossibleValuesAndNodes();
        }

        // if contact is an id, get its organisations
        else if (!isNaN(Number(contactId))) {
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, [contactId], null, null, true
            ).catch((): Contact[] => []);

            if (contacts.length) {
                const contact = contacts[0];

                organisationId = contact.PrimaryOrganisationID;

                // current value is acceptable - do not changed
                if (this.value && this.possibleValues.some((pv) => pv.toString() === this.value.toString())) {
                    return;
                }
            }
        }

        // else use it as simple string value (unknown contact => unknown organisation)
        else if (typeof contactId === 'string') {
            const node = this.treeHandler.getTree().find((n) => n.id === contactId);
            if (node) {
                organisationId = contactId;
                this.treeHandler.setTree([node]);
                this.treeHandler.setSelection([node], true, false, true);
            }
        }

        return this.setFormValue(organisationId ? [organisationId] : null);
    }

    public async setFormValue(value: any): Promise<void> {
        let newValue;
        if (value) {
            if (Array.isArray(value)) {
                newValue = value[0];
            } else {
                newValue = value;
            }
        }
        if (newValue !== this.value) {
            return super.setFormValue(newValue);
        }
    }

    private clearPossibleValuesAndNodes(): void {
        this.possibleValues = [];
        this.treeHandler.setTree([]);
        this.treeHandler.setSelection([]);
    }

    public setPossibleValues(): void {/* Do Nothing*/ }
    public addPossibleValues(): void {/* Do Nothing*/ }
    public removePossibleValues(): void {/* Do Nothing*/ }

}