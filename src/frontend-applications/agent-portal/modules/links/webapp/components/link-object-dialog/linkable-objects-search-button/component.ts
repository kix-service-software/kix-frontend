/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { FormService } from '../../../../../../modules/base-components/webapp/core/FormService';

class Component {

    private state: ComponentState;
    private formListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.formListenerId = 'LinkableObjectsSearchButton';
        this.state.formId = input.formId;
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject(["Translatable#Start search"]);
        await FormService.getInstance().registerFormInstanceListener(this.state.formId, {
            formListenerId: this.formListenerId,
            formValueChanged: async () => {
                const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
                if (formInstance) {
                    this.state.canSearch = formInstance.hasValues();
                }
            },
            updateForm: () => { return; }
        });
    }

    public async onDestroy(): Promise<void> {
        FormService.getInstance().removeFormInstanceListener(this.state.formId, this.formListenerId);
    }

    public executeSearch(): void {
        (this as any).emit('executeSearch');
    }
}

module.exports = Component;
