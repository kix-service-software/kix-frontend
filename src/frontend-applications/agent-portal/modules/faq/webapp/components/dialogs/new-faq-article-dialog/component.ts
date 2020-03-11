/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FAQDetailsContext } from '../../../core/context/FAQDetailsContext';
import { AbstractNewDialog } from '../../../../../../modules/base-components/webapp/core/AbstractNewDialog';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { RoutingConfiguration } from '../../../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../../../model/ContextMode';
import { FAQArticleProperty } from '../../../../model/FAQArticleProperty';

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create FAQ Article',
            'Translatable#FAQ Article successfully created.',
            KIXObjectType.FAQ_ARTICLE,
            new RoutingConfiguration(
                FAQDetailsContext.CONTEXT_ID, KIXObjectType.FAQ_ARTICLE,
                ContextMode.DETAILS, FAQArticleProperty.ID, true
            )
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
