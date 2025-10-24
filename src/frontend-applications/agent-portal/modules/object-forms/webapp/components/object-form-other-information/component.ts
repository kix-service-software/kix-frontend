/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ObjectFormHandler } from '../../core/ObjectFormHandler';
import { ComponentState } from './ComponentState';
import { ObjectFormEvent } from '../../../model/ObjectFormEvent';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private formhandler: ObjectFormHandler;

    public onCreate(input: any): void {
        super.onCreate(input, 'object-form-other-information');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        super.registerEventSubscriber(
            async function (data: any, eventId: string): Promise<void> {
                this.state.prepared = false;
                this.update();
            },
            [ObjectFormEvent.OTHER_INFORMATION_CHANGED]
        );

        if (!this.state.isConfigContext) {
            this.formhandler = await this.context?.getFormManager().getObjectFormHandler();
            this.update();
        }
    }

    private update(): void {
        this.state.formValues = this.formhandler?.objectFormValueMapper?.getNotConfiguredFormValues() || [];
        this.state.formLayout = this.formhandler?.form?.formLayout;
        this.state.prepared = this.state.formValues?.filter((fv) => fv.enabled && fv.visible).length > 0;
    }


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;