/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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
import { AgentSocketClient } from '../../../../user/webapp/core/AgentSocketClient';
import { User } from '../../../../user/model/User';
import { SearchCache } from '../../../model/SearchCache';

export class DeleteSearchAction extends AbstractAction {

    private user: User;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Delete Search';
        this.icon = 'kix-icon-trash';
        this.user = await AgentSocketClient.getInstance().getCurrentUser();
    }

    public canRun(): boolean {
        return this.isDeletable();
    }

    public async canShow(): Promise<boolean> {
        return this.isDeletable();
    }

    private isDeletable(): boolean {
        const context = ContextService.getInstance().getActiveContext<SearchContext>();
        const search = context?.getSearchCache();

        const isUserSearch = !search.userId || search.userId === this.user.UserID;

        return search?.name && isUserSearch;
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
