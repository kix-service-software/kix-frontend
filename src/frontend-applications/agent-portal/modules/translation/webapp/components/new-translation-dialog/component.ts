/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractNewDialog } from '../../../../../modules/base-components/webapp/core/AbstractNewDialog';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { DialogService } from '../../../../base-components/webapp/core/DialogService';
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Translation',
            'Translatable#Translation successfully created.',
            KIXObjectType.TRANSLATION_PATTERN,
            null
        );
    }

    public async onMount(): Promise<void> {
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
        BrowserUtil.toggleLoadingShield(false);
        DialogService.getInstance().submitMainDialog();
        FormService.getInstance().deleteFormInstance(this.state.formId);
        BrowserUtil.openSuccessOverlay(this.successHint);
    }

}

module.exports = Component;
