/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from 'vm';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { ObjectFormValue } from '../../../model/FormValues/ObjectFormValue';
import { FormLayout } from '../../../model/layout/FormLayout';
import { ObjectFormHandler } from '../../core/ObjectFormHandler';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;
    private formhandler: ObjectFormHandler;
    private contextInstanceId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.contextInstanceId = input.contextInstanceId;
        this.update();
    }

    public async onMount(): Promise<void> {
        if (this.contextInstanceId) {
            this.context = ContextService.getInstance().getContext(this.contextInstanceId);
        } else {
            this.context = ContextService.getInstance().getActiveContext();
            this.formhandler = await this.context?.getFormManager().getObjectFormHandler();
            this.update();
        }
    }

    private update(): void {
        this.state.formValues = this.formhandler?.objectFormValueMapper?.getNotConfiguredFormValues() || [];
        this.state.formLayout = this.formhandler?.form?.formLayout;
        this.state.prepared = this.state.formValues?.filter((fv) => fv.enabled && fv.visible).length > 0;
    }

}

module.exports = Component;