/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { ComponentState } from './ComponentState';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { ServiceRegistry } from '../../../../base-components/webapp/core/ServiceRegistry';
import { JobFormService } from '../../core';
import { ServiceType } from '../../../../base-components/webapp/core/ServiceType';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { IdService } from '../../../../../model/IdService';
import { JobProperty } from '../../../model/JobProperty';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';

class Component extends FormInputComponent<string, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.addActionField();
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
    }

    private async addActionField(): Promise<void> {
        if (!this.state.field.children || !!!this.state.field.children.length) {
            const formService = ServiceRegistry.getServiceInstance<JobFormService>(
                KIXObjectType.JOB, ServiceType.FORM
            );
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);

            if (formService && formInstance) {
                const actionsField = new FormFieldConfiguration(
                    'job-form-field-actions',
                    '1. Action', JobProperty.MACRO_ACTIONS, 'job-input-actions', false,
                    'Translatable#Helptext_Admin_JobCreateEdit_Actions', undefined, undefined, undefined, undefined,
                    undefined, 1, 200, 0
                );
                actionsField.instanceId = 'MACRO###' + IdService.generateDateBasedId();
                actionsField.property = actionsField.instanceId;
                formInstance.addFieldChildren(this.state.field, [actionsField], true);
            }
        }
    }

    public setCurrentValue(): Promise<void> {
        return;
    }

}

module.exports = Component;
