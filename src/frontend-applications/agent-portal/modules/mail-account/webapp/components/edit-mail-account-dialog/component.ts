/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractEditDialog } from '../../../../../modules/base-components/webapp/core/AbstractEditDialog';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { MailAccountDetailsContext } from '../../core';

class Component extends AbstractEditDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Update Email Account',
            undefined,
            KIXObjectType.MAIL_ACCOUNT,
            MailAccountDetailsContext.CONTEXT_ID
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
}

module.exports = Component;
