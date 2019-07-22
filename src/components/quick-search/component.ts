/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService, OverlayService } from '../../core/browser';
import { KIXObjectType, Ticket, OverlayType, StringContent, CRUD } from '../../core/model';
import { EventService } from '../../core/browser/event';
import { ApplicationEvent } from '../../core/browser/application';
import { SearchContext } from '../../core/browser/search/context/SearchContext';
import { TranslationService } from '../../core/browser/i18n/TranslationService';
import { AuthenticationSocketClient } from '../../core/browser/application/AuthenticationSocketClient';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { KIXObjectSearchService } from '../../core/browser/kix/search/KIXObjectSearchService';

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

            await KIXObjectSearchService.getInstance().executeFullTextSearch<Ticket>(
                KIXObjectType.TICKET, textValue
            ).catch((error) => {
                OverlayService.getInstance().openOverlay(
                    OverlayType.WARNING, null, new StringContent(error), 'Translatable#Ticket search error!', true
                );
            });

            ContextService.getInstance().setContext(SearchContext.CONTEXT_ID, null, null, null, null, true);

            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: false, hint: '' }
            );
        }
    }

}

module.exports = Component;
