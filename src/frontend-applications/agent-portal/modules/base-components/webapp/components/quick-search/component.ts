/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import {
    AuthenticationSocketClient
} from '../../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { StringContent } from '../../../../../modules/base-components/webapp/core/StringContent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { SearchService } from '../../../../search/webapp/core';

export class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.placeholder = await TranslationService.translate("Translatable#Quick search (Tickets)");
        const allowed = await AuthenticationSocketClient.getInstance().checkPermissions([
            new UIComponentPermission('tickets', [CRUD.READ])
        ]);
        this.state.show = allowed;
    }

    public async search(textValue: string): Promise<void> {
        if (textValue && textValue !== '') {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Search Tickets' }
            );

            await SearchService.getInstance().executeFullTextSearch(
                KIXObjectType.TICKET, textValue
            ).catch((error) => {
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, new StringContent(error), 'Translatable#Ticket search error!', null, true
                );
            });

            ContextService.getInstance().setContext('search', null, null, null, null, true);

            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: false, hint: '' }
            );
        }
    }

}

module.exports = Component;
