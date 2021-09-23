/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { UserProperty } from '../../../model/UserProperty';
import { FormFieldOption } from '../../../../../model/configuration/FormFieldOption';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';
import { InputFieldTypes } from '../../../../base-components/webapp/core/InputFieldTypes';
import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { FormPageConfiguration } from '../../../../../model/configuration/FormPageConfiguration';
import { FormGroupConfiguration } from '../../../../../model/configuration/FormGroupConfiguration';
import { ValidationSeverity } from '../../../../base-components/webapp/core/ValidationSeverity';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { Error } from '../../../../../../../server/model/Error';
import { SetupStep } from '../../../../setup-assistant/webapp/core/SetupStep';
import { User } from '../../../model/User';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { SetupService } from '../../../../setup-assistant/webapp/core/SetupService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private step: SetupStep;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Save & Continue', 'Translatable#Skip & Continue'
        ]);

        await this.prepareForm();
        this.state.prepared = true;
    }

    public onInput(input: any): void {
        this.step = input.step;
        this.state.completed = this.step ? this.step.completed : false;
    }

    private async prepareForm(): Promise<void> {

        const formFields = [
            new FormFieldConfiguration(
                'update-admin-password-login',
                'Translatable#Login Name', UserProperty.USER_LOGIN, null, true,
                'Translatable#Helptext_User_UserCreateEdit_Login'
            ),
            new FormFieldConfiguration(
                'update-admin-password-password',
                'Translatable#Password', UserProperty.USER_PASSWORD, null, true,
                'Translatable#Helptext_User_UserCreateEdit_Password',
                [
                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                ]
            )
        ];

        const form = new FormConfiguration(
            'update-admin-password-form', 'Change Admin Password', null, KIXObjectType.USER,
            true, FormContext.EDIT, null,
            [
                new FormPageConfiguration(
                    'update-admin-password-form-page', null, null, true, false,
                    [
                        new FormGroupConfiguration('update-admin-password-form-group', null, null, null, formFields)
                    ]
                )
            ]
        );

        FormService.getInstance().addForm(form);
        this.state.formId = form.id;

        const context = ContextService.getInstance().getActiveContext();
        context?.getFormManager()?.setFormId(this.state.formId);

        setTimeout(() => this.initFormValues(form.id), 500);
    }

    private async initFormValues(formId: string): Promise<void> {
        const users = await KIXObjectService.loadObjects<User>(KIXObjectType.USER, [1])
            .catch((): User[] => []);

        if (users && users.length) {
            const context = ContextService.getInstance().getActiveContext();
            const formInstance = await context?.getFormManager()?.getFormInstance();

            formInstance.provideFormFieldValuesForProperties([
                [UserProperty.USER_LOGIN, users[0].UserLogin]
            ], null);
        }
    }

    public async submit(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();

        const result = await formInstance.validateForm();
        const validationError = result.some((r) => r && r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            BrowserUtil.showValidationError(result);
        } else {
            BrowserUtil.toggleLoadingShield('SETUP_ADMIN_SHIELD', true, 'Translatable#Change Admin Password');
            await this.updateUser(formInstance);
            BrowserUtil.toggleLoadingShield('SETUP_ADMIN_SHIELD', false);
        }
    }

    private async updateUser(formInstance: FormInstance): Promise<void> {
        const loginValue = await formInstance.getFormFieldValueByProperty(UserProperty.USER_LOGIN);
        const passwordValue = formInstance.getFormFieldValueByProperty(UserProperty.USER_PASSWORD);

        const userId = await KIXObjectService.updateObject(
            KIXObjectType.USER,
            [
                [UserProperty.USER_LOGIN, loginValue.value],
                [UserProperty.USER_PASSWORD, (await passwordValue).value]
            ],
            1
        ).catch((error: Error) => {
            BrowserUtil.openErrorOverlay(
                error.Message ? `${error.Code}: ${error.Message}` : error.toString()
            );
            return null;
        });

        if (userId) {
            BrowserUtil.openSuccessOverlay('Translatable#The password is changed for Admin.');
            await SetupService.getInstance().stepCompleted(this.step.id, null);
        }
    }

    public skip(): void {
        SetupService.getInstance().stepSkipped(this.step.id);
    }
}

module.exports = Component;
