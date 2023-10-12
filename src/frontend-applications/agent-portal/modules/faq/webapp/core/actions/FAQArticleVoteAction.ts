/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';

import { UIComponentPermission } from '../../../../../model/UIComponentPermission';

import { CRUD } from '../../../../../../../server/model/rest/CRUD';

import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';

import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';

import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { AuthenticationSocketClient } from '../../../../base-components/webapp/core/AuthenticationSocketClient';

export class FAQArticleVoteAction extends AbstractAction {

    public hasLink: boolean = false;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Rate';
        this.icon = 'kix-icon-star-fully';
    }

    public async canShow(): Promise<boolean> {
        let show = false;
        const context = ContextService.getInstance().getActiveContext();
        const objectId = context.getObjectId();

        const permissions = [
            new UIComponentPermission(`faq/articles/${objectId}/votes`, [CRUD.CREATE])
        ];

        show = await AuthenticationSocketClient.getInstance().checkPermissions(permissions);
        return show;
    }

    public async run(event: any): Promise<void> {
        if (this.data && Array.isArray(this.data) && this.data.length) {
            const faqArticle = this.data[0];

            OverlayService.getInstance().openOverlay(
                OverlayType.CONTENT_OVERLAY,
                'faq-vote-action-overlay',
                new ComponentContent('faq-vote-selector', { faqArticle }),
                'Translatable#FAQ rating',
                null,
                false,
                [
                    event.target.getBoundingClientRect().left,
                    event.target.getBoundingClientRect().top
                ],
                'faq-vote-action-overlay'
            );
        }
    }

}
