/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractEditDialog } from '../../../../base-components/webapp/core/AbstractEditDialog';
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ComponentState } from './ComponentState';

class Component extends AbstractEditDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Update Report Definition',
            'Translatable#Report Definition successfully updated.',
            KIXObjectType.REPORT_DEFINITION,
            null
        );
    }

    public async onMount(): Promise<void> {
        this.state.translations = TranslationService.createTranslationObject([
            'Translatable#Cancel', 'Translatable#Save'
        ]);
        this.createForm();
        this.state.prepared = true;
    }

    private createForm(): void {
        FormService.getInstance().deleteFormInstance('edit-report-definition-form');

        const form = new FormConfiguration(
            'edit-report-definition-form', 'edit Report Form', [], KIXObjectType.REPORT_DEFINITION,
            true, FormContext.EDIT
        );

        FormService.getInstance().addForm(form);
        this.state.formId = form.id;
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit().catch((e) => null);
    }

}

module.exports = Component;
