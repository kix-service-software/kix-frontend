/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { SearchContext } from '../SearchContext';

export class SaveSearchAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Save Search';
        this.icon = 'kix-icon-save';
    }

    public canRun(): boolean {
        const context = ContextService.getInstance().getActiveContext<SearchContext>();
        const cache = context?.getSearchCache();
        return typeof cache !== 'undefined' && cache !== null;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const content = new ComponentContent('save-search-template-overlay', null);
            OverlayService.getInstance().openOverlay(
                OverlayType.CONTENT_OVERLAY, 'save-search-template', content, 'Translatable#Save Search',
                null, false, null, null, true, true, null, false
            );
        }
    }

}
