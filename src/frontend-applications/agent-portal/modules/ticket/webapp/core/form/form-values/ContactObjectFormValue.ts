/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration } from '../../../../../../model/configuration/AutoCompleteConfiguration';
import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { FormValidationService } from '../../../../../base-components/webapp/core/FormValidationService';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { TreeNode, TreeUtil } from '../../../../../base-components/webapp/core/tree';
import { Contact } from '../../../../../customer/model/Contact';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { Ticket } from '../../../../model/Ticket';

export class ContactObjectFormValue extends SelectObjectFormValue {

    public constructor(
        property: string,
        ticket: Ticket,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, ticket, objectValueMapper, parent);
        this.objectType = KIXObjectType.CONTACT;
        this.isAutoComplete = true;
        this.autoCompleteConfiguration = new AutoCompleteConfiguration();
    }

    public async initFormValue(): Promise<void> {
        this.freeText = true;
        super.initFormValue();
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        let newValue;
        if (value) {
            if (Array.isArray(value)) {
                newValue = value[0];
            } else {
                newValue = value;
            }

            // if unknown contact
            if (newValue && isNaN(Number(newValue))) {
                newValue = await this.getPossibleContactId(newValue);
            }
        }
        return super.setFormValue(newValue, force);
    }

    public async setObjectValue(value: (string | number)[]): Promise<void> {
        let contactId = null;

        if (Array.isArray(value)) {
            contactId = value[0];
        } else {
            contactId = value;
        }

        if (contactId) {
            const nodes = this.getSelectableTreeNodeValues();
            const currentNode = TreeUtil.findNode(nodes, contactId);
            contactId = currentNode?.id || contactId;
            if (isNaN(contactId)) {
                contactId = await this.getPossibleContactId(contactId);
            }
        }

        // if unknown contact
        if (contactId && isNaN(Number(contactId))) {
            const node = new TreeNode(value, value.toString());
            this.treeHandler.setTree([node]);
            this.treeHandler.setSelection([node], true, true);
        }

        await super.setObjectValue(contactId);
    }

    private async getPossibleContactId(contactId: number | string): Promise<string | number> {
        if (FormValidationService.getInstance().isValidEmail(contactId.toString())) {
            const loadingOptions = new KIXObjectLoadingOptions([
                new FilterCriteria(
                    'Email', SearchOperator.EQUALS, FilterDataType.STRING,
                    FilterType.AND, contactId
                )
            ]);
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, null, loadingOptions, null, true
            ).catch(() => null);
            if (contacts?.length) {
                contactId = contacts[0].ID;
            }
        } else {
            contactId = null;
        }

        return contactId;
    }

}