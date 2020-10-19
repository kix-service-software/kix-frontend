/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { SetupStep } from '../../../../setup-assistant/webapp/core/SetupStep';
import { SetupEvent } from '../../../../setup-assistant/webapp/core/SetupEvent';
import { SetupStepCompletedEventData } from '../../../../setup-assistant/webapp/core/SetupStepCompletedEventData';
import { MailAccount } from '../../../model/MailAccount';
import { MailAccountProperty } from '../../../model/MailAccountProperty';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { AuthenticationSocketClient } from '../../../../base-components/webapp/core/AuthenticationSocketClient';
import { SetupService } from '../../../../setup-assistant/webapp/core/SetupService';

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

        this.prepareForm();
        this.state.prepared = true;
    }

    public onInput(input: any) {
        this.step = input.step;
        this.update = this.step && this.step.result && this.step.result.accountId;
        this.state.completed = this.step ? this.step.completed : false;
    }

    public onDestroy(): void {
        FormService.getInstance().deleteFormInstance(this.state.formId);
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

        this.state.formId = await FormService.getInstance().getFormIdByContext(
            this.update ? FormContext.EDIT : FormContext.NEW, KIXObjectType.MAIL_ACCOUNT
        );
        if (this.state.formId) {
            FormService.getInstance().getFormInstance(
                this.state.formId, false, account, !this.state.canUpdate ? true : null
            );
        }
    }

    public async submit(logout: boolean): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);

        const result = await formInstance.validateForm();
        const validationError = result.some((r) => r && r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            BrowserUtil.showValidationError(result);
        } else {

            BrowserUtil.toggleLoadingShield(
                true, this.update ? 'Translatable#Update Email Account' : 'Translatable#Create Email Account'
            );

            if (this.update) {
                await this.updateAccount();
            } else {
                await this.createAccount();
            }

            BrowserUtil.toggleLoadingShield(false);
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
