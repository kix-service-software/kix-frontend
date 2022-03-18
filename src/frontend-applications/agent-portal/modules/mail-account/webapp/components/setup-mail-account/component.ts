/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { ValidationSeverity } from '../../../../base-components/webapp/core/ValidationSeverity';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { Error } from '../../../../../../../server/model/Error';
import { SetupStep } from '../../../../setup-assistant/webapp/core/SetupStep';
import { MailAccount } from '../../../model/MailAccount';
import { MailAccountProperty } from '../../../model/MailAccountProperty';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { AuthenticationSocketClient } from '../../../../base-components/webapp/core/AuthenticationSocketClient';
import { SetupService } from '../../../../setup-assistant/webapp/core/SetupService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private step: SetupStep;
    private update: boolean;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Save & Fetch', 'Translatable#Skip & Continue'
        ]);

        await this.prepareForm();
        this.state.prepared = true;
    }

    public onInput(input: any): void {
        this.step = input.step;
        this.update = this.step && this.step.result && this.step.result.accountId;
        this.state.completed = this.step ? this.step.completed : false;
    }

    private async prepareForm(): Promise<void> {
        let account: MailAccount;
        if (this.update) {
            const accounts = await KIXObjectService.loadObjects<MailAccount>(
                KIXObjectType.MAIL_ACCOUNT, [this.step.result.accountId],
                null, null, true
            ).catch(() => [] as MailAccount[]);
            if (accounts && accounts[0]) {
                account = accounts[0];
                const permissions = [new UIComponentPermission(
                    `/system/communication/mailaccounts/${this.step.result.accountId}`,
                    [CRUD.UPDATE]
                )];
                this.state.canUpdate = await AuthenticationSocketClient.getInstance().checkPermissions(permissions);
            } else {
                this.update = false;
            }
        }

        const formId = await FormService.getInstance().getFormIdByContext(
            this.update ? FormContext.EDIT : FormContext.NEW, KIXObjectType.MAIL_ACCOUNT
        );
        if (formId) {
            this.state.formId = formId;
            const context = ContextService.getInstance().getActiveContext();
            context?.getFormManager()?.setFormId(formId, account);
        }
    }

    public async submit(logout: boolean): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();

        const result = await formInstance.validateForm();
        const validationError = result.some((r) => r && r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            BrowserUtil.showValidationError(result);
        } else {

            BrowserUtil.toggleLoadingShield(
                'SETUP_MAIL_SHIELD', true, this.update ? 'Translatable#Update Email Account' : 'Translatable#Create Email Account'
            );

            if (this.update) {
                await this.updateAccount();
            } else {
                await this.createAccount();
            }

            BrowserUtil.toggleLoadingShield('SETUP_MAIL_SHIELD', false);
        }
    }

    private async updateAccount(): Promise<void> {
        const accountId = await KIXObjectService.updateObjectByForm(
            KIXObjectType.MAIL_ACCOUNT, this.state.formId, this.step.result.accountId
        ).catch((error: Error) => {
            BrowserUtil.openErrorOverlay(
                error.Message ? `${error.Code}: ${error.Message}` : error.toString()
            );
            return null;
        });

        const fetchOk = await this.checkFetch(accountId);
        if (fetchOk) {
            await SetupService.getInstance().stepCompleted(this.step.id, { accountId });
        }
    }

    private async createAccount(): Promise<void> {
        const accountId = await KIXObjectService.createObjectByForm(
            KIXObjectType.MAIL_ACCOUNT, this.state.formId, null
        ).catch((error: Error) => {
            BrowserUtil.openErrorOverlay(
                error.Message ? `${error.Code}: ${error.Message}` : error.toString()
            );
            return null;
        });

        const fetchOk = await this.checkFetch(accountId);
        if (fetchOk) {
            await SetupService.getInstance().stepCompleted(this.step.id, { accountId });
        } else {
            KIXObjectService.deleteObject(KIXObjectType.MAIL_ACCOUNT, [accountId]);
        }
    }

    private async checkFetch(accountId: number): Promise<boolean> {
        let fetchOk: boolean = true;
        if (accountId) {
            await KIXObjectService.updateObject(
                KIXObjectType.MAIL_ACCOUNT, [[MailAccountProperty.EXEC_FETCH, 1]], accountId, false
            ).catch((error: Error) => {
                BrowserUtil.openErrorOverlay(`Fetch results in error (${error.Code}): ${error.Message}`);
                fetchOk = false;
            });
        }
        return fetchOk;
    }

    public skip(): void {
        SetupService.getInstance().stepSkipped(this.step.id);
    }
}

module.exports = Component;
