/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { Contact } from '../../../../model/Contact';
import { ContactProperty } from '../../../../model/ContactProperty';

export class PrimaryOrganisationFormValue extends SelectObjectFormValue<number> {

    private objectBindingId: string;

    public constructor(
        property: string,
        contact: Contact,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, contact, objectValueMapper, parent);

        this.objectType = KIXObjectType.ORGANISATION;
        this.isAutoComplete = false;
        this.hasFilter = false;
        this.multiselect = false;
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();

        this.possibleValues = this.object?.OrganisationIDs;

        this.objectBindingId = this.objectValueMapper?.object?.addBinding(
            ContactProperty.ORGANISATION_IDS,
            async (value: number[]) => {
                this.possibleValues = this.object?.OrganisationIDs;
                if (!this.value && this.possibleValues?.length) {
                    await this.setFormValue(this.possibleValues[0], true);
                }
                await this.loadSelectedValues();
            }
        );
    }

    public destroy(): void {
        if (this.objectBindingId?.length && this.objectValueMapper?.object) {
            this.objectValueMapper.object.removeBindings([this.objectBindingId]);
        }
        super.destroy();
    }

    public async setPossibleValues(): Promise<void> {
        return;
    }

    public async addPossibleValues(): Promise<void> {
        return;
    }

    public async removePossibleValues(): Promise<void> {
        return;
    }

}