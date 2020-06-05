/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { AbstractEditDialog } from '../../../../../base-components/webapp/core/AbstractEditDialog';
import { FAQDetailsContext } from '../../../core/context/FAQDetailsContext';

class Component extends AbstractEditDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Update FAQ Article',
            undefined,
            KIXObjectType.FAQ_ARTICLE,
            FAQDetailsContext.CONTEXT_ID
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
        super.submit();
    }

}

module.exports = Component;
