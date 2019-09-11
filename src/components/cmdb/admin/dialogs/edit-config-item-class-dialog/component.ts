/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../core/model';
import { ComponentState } from './ComponentState';
import { ConfigItemClassDetailsContext } from '../../../../../core/browser/cmdb';
import { AbstractEditDialog } from '../../../../../core/browser/components/dialog';

class Component extends AbstractEditDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Update CI Class',
            undefined,
            KIXObjectType.CONFIG_ITEM_CLASS,
            ConfigItemClassDetailsContext.CONTEXT_ID
        );
    }

    public async onMount(): Promise<void> {
        this.state.loading = true;
        await super.onMount();
        this.state.loading = false;
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
