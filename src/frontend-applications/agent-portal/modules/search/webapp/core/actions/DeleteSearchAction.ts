/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { ConfirmOverlayContent } from '../../../../../modules/base-components/webapp/core/ConfirmOverlayContent';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { Error } from '../../../../../../../server/model/Error';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { SearchContext } from '../SearchContext';

export class DeleteSearchAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Delete Search';
        this.icon = 'kix-icon-trash';
    }

    public canRun(): boolean {
        const context = ContextService.getInstance().getActiveContext<SearchContext>();
        const cache = context?.getSearchCache();
        return typeof cache !== 'undefined' && cache !== null && cache.name !== null;
    }

    public async run(): Promise<void> {
        if (this.canRun()) {
            const context = ContextService.getInstance().getActiveContext<SearchContext>();
            const cache = context?.getSearchCache();
            const question = await TranslationService.translate(
                'Translatable#Search {0} will be deleted. Are you sure?', [cache.name]
            );
            const content = new ComponentContent(
                'confirm-overlay', new ConfirmOverlayContent(question, this.deleteSearch.bind(this))
            );

            OverlayService.getInstance().openOverlay(
                OverlayType.CONFIRM, null, content, 'Translatable#Delete Search', null, false
            );
        }
    }

    private async deleteSearch(): Promise<void> {
        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
            loading: true, hint: 'Translatable#Delete Search'
        });

        const context = ContextService.getInstance().getActiveContext<SearchContext>();
        await context?.deleteSearch()
            .catch((error: Error) => BrowserUtil.openErrorOverlay(error.Message));

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });

        BrowserUtil.openSuccessOverlay('Translatable#Search template successfully removed.');
    }

}
