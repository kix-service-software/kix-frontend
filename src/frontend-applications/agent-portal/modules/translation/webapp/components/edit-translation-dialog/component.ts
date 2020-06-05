/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { ComponentState } from './ComponentState';
import { EditTranslationDialogContext } from '../../core/admin/context';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractEditDialog } from '../../../../base-components/webapp/core/AbstractEditDialog';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { DialogService } from '../../../../base-components/webapp/core/DialogService';
import { TranslationService } from '../../core/TranslationService';

class Component extends AbstractEditDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Update Translation',
            undefined,
            KIXObjectType.TRANSLATION_PATTERN,
            EditTranslationDialogContext.CONTEXT_ID
        );
    }

    public async onMount(): Promise<void> {
        // tslint:disable-next-line:max-line-length
        DialogService.getInstance().setMainDialogHint('Translatable#For keyboard navigation, press \'Ctrl\' to switch focus to dialog. See manual for more detailed information.');
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Cancel', 'Translatable#Save'
        ]);
        await super.onMount();
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit();
    }

    protected async handleDialogSuccess(objectId: string | number): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(false);
        DialogService.getInstance().submitMainDialog();
        FormService.getInstance().deleteFormInstance(this.state.formId);
        BrowserUtil.openSuccessOverlay(this.successHint);
    }

}

module.exports = Component;
