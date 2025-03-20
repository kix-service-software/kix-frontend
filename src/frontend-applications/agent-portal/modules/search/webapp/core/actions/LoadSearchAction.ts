/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { SearchService } from '../SearchService';
import { SearchCache } from '../../../model/SearchCache';

export class LoadSearchAction extends AbstractAction<SearchCache> {

    public async initAction(): Promise<void> {
        this.icon = 'kix-icon-search';
        this.text = 'Translatable#Search';
    }

    public async run(): Promise<void> {
        let hint = await TranslationService.translate('Translatable#Search', []);
        hint = `${hint} ${this.data?.name}`;

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: true, hint });
        await SearchService.getInstance().executeSearchCache(this.data?.id, this.data?.name, null, null, true);

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });
    }

}
