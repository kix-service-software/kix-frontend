/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from "../../../../../modules/base-components/webapp/core/AbstractAction";
import { TranslationService } from "../../../../translation/webapp/core";
import { EventService } from "../../../../../modules/base-components/webapp/core/EventService";
import { ApplicationEvent } from "../../../../../modules/base-components/webapp/core/ApplicationEvent";
import { SearchService, SearchContext } from "..";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";

export class LoadSearchAction extends AbstractAction {

    public async  initAction(): Promise<void> {
        this.icon = 'kix-icon-search';
        this.text = 'Translatable#Search';
    }

    public async run(): Promise<void> {
        let hint = await TranslationService.translate('Translatable#Search', []);
        hint = `${hint} ${this.data}`;

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: true, hint });
        if (this.data && typeof this.data === 'string') {
            await SearchService.getInstance().loadSearch(this.data);
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
        ContextService.getInstance().setContext(SearchContext.CONTEXT_ID, null, null, null, null, true);
    }

}