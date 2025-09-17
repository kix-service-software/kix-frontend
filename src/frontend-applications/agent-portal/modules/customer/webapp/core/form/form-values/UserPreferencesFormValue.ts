/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormContext } from '../../../../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { FormValueProperty } from '../../../../../object-forms/model/FormValueProperty';
import { DateFormValue } from '../../../../../object-forms/model/FormValues/DateFormValue';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { PersonalSettingsProperty } from '../../../../../user/model/PersonalSettingsProperty';
import { User } from '../../../../../user/model/User';
import { UserPreference } from '../../../../../user/model/UserPreference';
import { UserProperty } from '../../../../../user/model/UserProperty';
import { InitialSiteURLFormValue } from './InitialSiteURLFormValue';
import { LanguageFormValue } from './LanguageFormValue';
import { NotificationFormValue } from './NotificationFormValue';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { KIXObjectProperty } from '../../../../../../model/kix/KIXObjectProperty';
import { AutoCompleteConfiguration } from '../../../../../../model/configuration/AutoCompleteConfiguration';

export class UserPreferencesFormValue extends ObjectFormValue<UserPreference[]> {

    public readonly COUNT_CONTAINER = true;

    protected oooFormValue: ObjectFormValue;
    protected myQueuesFormValue: ObjectFormValue;
    protected notificationsFormValue: ObjectFormValue;

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

        const preferences = user?.Preferences;

        this.addLanguageFormValue(preferences, objectValueMapper);
        this.oooFormValue = this.addOutOfOfficeFormValues(preferences, objectValueMapper, user.UserID);
        this.addInitialSiteURLFormValue(preferences, objectValueMapper);
        this.myQueuesFormValue = this.addMyQueuesFormValue(preferences, objectValueMapper);
        this.notificationsFormValue = this.addNotificationFormValue(preferences, objectValueMapper);

        if (objectValueMapper.formContext === FormContext.EDIT) {
            this.addUserTokenFormValue(preferences, objectValueMapper);
        }

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
        const agentPreferencesIds = [
            this.oooFormValue.instanceId,
            this.notificationsFormValue.instanceId,
            this.myQueuesFormValue.instanceId
        ];

        for (const fv of this.formValues) {
            if (!this.user?.IsAgent && agentPreferencesIds.some((id) => id === fv.instanceId)) {
                continue;
            }
            if (this.user && !Array.isArray(this.user.Preferences)) {
                this.user.Preferences = [];
            }

            if (fv.formValues?.length) {
                for (const sfv of fv.formValues) {
                    await sfv.enable();

                    if (
                        sfv['object']
                        && !this.user.Preferences.some((p) => p.ID === sfv['object'].ID)
                    ) {
                        this.user.Preferences.push(sfv['object']);
                    }
                }
            }

            await fv.enable();

            if (
                fv['object']
                && !this.user.Preferences.some((p) => p.ID === fv['object'].ID)
            ) {
                this.user.Preferences.push(fv['object']);
            }
        }

        await super.enable();
    }

    public async disable(): Promise<void> {
        for (const fv of this.formValues) {
            await fv.disable();
        }

        await super.disable();
    }

    private addLanguageFormValue(
        preferences: UserPreference[], objectValueMapper: ObjectFormValueMapper
    ): void {
        let preference = preferences.find((p) => p.ID === PersonalSettingsProperty.USER_LANGUAGE);
        if (!preference) {
            preference = new UserPreference();
            preference.ID = PersonalSettingsProperty.USER_LANGUAGE;
            preferences.push(preference);
        }

        const formValue = new LanguageFormValue('Value', preference, objectValueMapper, this);
        this.formValues.push(formValue);
    }

    private addOutOfOfficeFormValues(
        preferences: UserPreference[], objectValueMapper: ObjectFormValueMapper, userId: number
    ): ObjectFormValue {

        const oofFormValue = new ObjectFormValue(null, null, objectValueMapper, null);
        oofFormValue.label = 'Translatable#Out Of Office';
        oofFormValue.visible = true;
        oofFormValue.inputComponentId = 'no-input';

        this.formValues.push(oofFormValue);

        let startPreference = preferences.find((p) => p.ID === PersonalSettingsProperty.OUT_OF_OFFICE_START);
        if (!startPreference) {
            startPreference = new UserPreference();
            startPreference.ID = PersonalSettingsProperty.OUT_OF_OFFICE_START;
            preferences.push(startPreference);
        }

        const startFormValue = new DateFormValue('Value', startPreference, objectValueMapper, oofFormValue);
        startFormValue.label = 'Translatable#From';
        startFormValue.visible = true;
        startFormValue.isControlledByParent = true;
        oofFormValue.formValues.push(startFormValue);

        let endPreference = preferences.find((p) => p.ID === PersonalSettingsProperty.OUT_OF_OFFICE_END);
        if (!endPreference) {
            endPreference = new UserPreference();
            endPreference.ID = PersonalSettingsProperty.OUT_OF_OFFICE_END;
            preferences.push(endPreference);
        }

        const endFormValue = new DateFormValue('Value', endPreference, objectValueMapper, oofFormValue);
        endFormValue.label = 'Translatable#Till';
        endFormValue.visible = true;
        endFormValue.isControlledByParent = true;
        oofFormValue.formValues.push(endFormValue);

        let substitutePreference = preferences.find((p) => p.ID === PersonalSettingsProperty.OUT_OF_OFFICE_SUBSTITUTE);
        if (!substitutePreference) {
            substitutePreference = new UserPreference();
            substitutePreference.ID = PersonalSettingsProperty.OUT_OF_OFFICE_SUBSTITUTE;
            preferences.push(substitutePreference);
        }

        const myQueues = preferences.find((p) => p.ID === PersonalSettingsProperty.MY_QUEUES);
        const myQueuesValue = Array.isArray(myQueues?.Value)
            ? myQueues?.Value
            : isNaN(Number(myQueues?.Value)) ? [0] : [myQueues?.Value];
        const substituteFormValue = new SelectObjectFormValue('Value', substitutePreference, objectValueMapper, oofFormValue);
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
                    FilterType.AND, [1, userId]
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
        oofFormValue.formValues.push(substituteFormValue);

        return oofFormValue;
    }

    private addInitialSiteURLFormValue(preferences: UserPreference[], objectValueMapper: ObjectFormValueMapper): void {
        let preference = preferences.find((p) => p.ID === PersonalSettingsProperty.INITIAL_SITE_URL);
        if (!preference) {
            preference = new UserPreference();
            preference.ID = PersonalSettingsProperty.INITIAL_SITE_URL;
            preferences.push(preference);
        }
        const formValue = new InitialSiteURLFormValue('Value', preference, objectValueMapper, this);
        this.formValues.push(formValue);
    }

    private addMyQueuesFormValue(
        preferences: UserPreference[], objectValueMapper: ObjectFormValueMapper
    ): ObjectFormValue {
        let preference = preferences.find((p) => p.ID === PersonalSettingsProperty.MY_QUEUES);
        if (!preference) {
            preference = new UserPreference();
            preference.ID = PersonalSettingsProperty.MY_QUEUES;
            preferences.push(preference);
        }

        const formValue = new SelectObjectFormValue('Value', preference, objectValueMapper, this);
        formValue.label = 'Translatable#My Queues';
        formValue.objectType = KIXObjectType.QUEUE;
        formValue.maxSelectCount = -1;
        formValue.setNewInitialState(FormValueProperty.VISIBLE, true);
        this.formValues.push(formValue);

        return formValue;
    }

    private addNotificationFormValue(
        preferences: UserPreference[], objectValueMapper: ObjectFormValueMapper
    ): ObjectFormValue {
        let preference = preferences.find((p) => p.ID === UserProperty.NOTIFICATIONS);
        if (!preference) {
            preference = new UserPreference();
            preference.ID = UserProperty.NOTIFICATIONS;
            preferences.push(preference);
        }

        const formValue = new NotificationFormValue('Value', preference, objectValueMapper, this);
        this.formValues.push(formValue);

        return formValue;
    }

    private addUserTokenFormValue(
        preferences: UserPreference[], objectValueMapper: ObjectFormValueMapper
    ): void {
        let preference = preferences.find((p) => p.ID === PersonalSettingsProperty.USER_TOKEN);
        if (!preference) {
            preference = new UserPreference();
            preference.ID = PersonalSettingsProperty.USER_TOKEN;
            preferences.push(preference);
        }

        const formValue = new ObjectFormValue('Value', preference, objectValueMapper, this);
        formValue.label = 'Translatable#User Token';
        formValue.inputComponentId = 'user-token-form-input';
        formValue.readonly = true;
        this.formValues.push(formValue);
    }

}