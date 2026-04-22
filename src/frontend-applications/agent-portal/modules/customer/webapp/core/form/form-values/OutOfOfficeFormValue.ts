/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { DateFormValue } from '../../../../../object-forms/model/FormValues/DateFormValue';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { PersonalSettingsProperty } from '../../../../../user/model/PersonalSettingsProperty';
import { User } from '../../../../../user/model/User';
import { UserPreference } from '../../../../../user/model/UserPreference';
import { UserProperty } from '../../../../../user/model/UserProperty';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { KIXObjectProperty } from '../../../../../../model/kix/KIXObjectProperty';
import { AutoCompleteConfiguration } from '../../../../../../model/configuration/AutoCompleteConfiguration';
import { OutOfOfficeProperty } from '../../../../../user/model/OutOfOfficeProperty';
import { OutOfOffice } from '../../../../../user/model/OutOfOffice';

export class OutOfOfficeFormValue extends ObjectFormValue<OutOfOffice> {

    public readonly COUNT_CONTAINER = true;

    public constructor(
        property: string,
        public user: User,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, user, objectValueMapper, parent);

        this.inputComponentId = null;

        if (!Array.isArray(user?.Preferences)) {
            user.Preferences = [];
        }
        if (!user.OutOfOffice) {
            user.OutOfOffice = new OutOfOffice();
        }

        const preferences = user?.Preferences;

        this.addOutOfOfficeFormValues(user, preferences, objectValueMapper);

        this.visible = false;

        this.formValues.forEach((fv) => {
            fv.visible = true;
            fv.isControlledByParent = true;
        });
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        await super.initFormValueByField(field);
        this.visible = false;
    }

    public async enable(): Promise<void> {
        for (const fv of this.formValues) {
            if (!this.user?.IsAgent) {
                continue;
            }
            if (this.user && !this.user.OutOfOffice) {
                this.user.OutOfOffice = new OutOfOffice();
            }

            if (fv.formValues?.length) {
                for (const sfv of fv.formValues) {
                    await sfv.enable();
                }
            }

            await fv.enable();
        }

        await super.enable();
    }

    public async disable(): Promise<void> {
        for (const fv of this.formValues) {
            await fv.disable();
        }

        await super.disable();

        this.value = new OutOfOffice();
    }

    private addOutOfOfficeFormValues(
        user: User, preferences: UserPreference[], objectValueMapper: ObjectFormValueMapper
    ): void {

        const oooFormValue = new ObjectFormValue(null, null, objectValueMapper, null);
        oooFormValue.label = 'Translatable#Out Of Office';
        oooFormValue.visible = true;
        oooFormValue.inputComponentId = 'no-input';

        this.formValues.push(oooFormValue);

        const startFormValue = new DateFormValue(
            OutOfOfficeProperty.START, user?.OutOfOffice, objectValueMapper, oooFormValue
        );
        startFormValue.label = 'Translatable#From';
        startFormValue.visible = true;
        startFormValue.isControlledByParent = true;
        oooFormValue.formValues.push(startFormValue);

        const endFormValue = new DateFormValue(
            OutOfOfficeProperty.END, user?.OutOfOffice, objectValueMapper, oooFormValue
        );
        endFormValue.label = 'Translatable#Till';
        endFormValue.visible = true;
        endFormValue.isControlledByParent = true;
        oooFormValue.formValues.push(endFormValue);

        const myQueues = preferences.find((p) => p.ID === PersonalSettingsProperty.MY_QUEUES);
        const myQueuesValue = Array.isArray(myQueues?.Value)
            ? myQueues?.Value
            : isNaN(Number(myQueues?.Value)) ? [0] : [myQueues?.Value];
        const substituteFormValue = new SelectObjectFormValue(
            OutOfOfficeProperty.SUBSTITUTE, user?.OutOfOffice, objectValueMapper, oooFormValue
        );
        substituteFormValue.label = 'Translatable#Substitute';
        substituteFormValue.objectType = KIXObjectType.USER;
        substituteFormValue.isAutoComplete = true;
        substituteFormValue.autoCompleteConfiguration = new AutoCompleteConfiguration();
        substituteFormValue.multiselect = false;
        substituteFormValue.loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    UserProperty.PREFERENCES + '.' + PersonalSettingsProperty.MY_QUEUES,
                    SearchOperator.IN, FilterDataType.NUMERIC,
                    FilterType.AND, myQueuesValue
                ),
                new FilterCriteria(
                    UserProperty.IS_AGENT,
                    SearchOperator.EQUALS, FilterDataType.NUMERIC,
                    FilterType.AND, 1
                ),
                new FilterCriteria(
                    'UserIDs',
                    SearchOperator.NOT_IN, FilterDataType.NUMERIC,
                    FilterType.AND, [1, user?.UserID]
                ),
                new FilterCriteria(
                    KIXObjectProperty.VALID_ID,
                    SearchOperator.EQUALS, FilterDataType.NUMERIC,
                    FilterType.AND, 1
                )
            ]
        );
        substituteFormValue.visible = true;
        substituteFormValue.isControlledByParent = true;
        oooFormValue.formValues.push(substituteFormValue);
    }

}