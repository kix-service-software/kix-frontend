/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextMode } from '../../../../../../model/ContextMode';
import { ApplicationEvent } from '../../../../../base-components/webapp/core/ApplicationEvent';
import { ContextEvents } from '../../../../../base-components/webapp/core/ContextEvents';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { OverlayService } from '../../../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../base-components/webapp/core/OverlayType';
import { StringContent } from '../../../../../base-components/webapp/core/StringContent';
import { SearchService } from '../../../../../search/webapp/core';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { ComponentState } from './ComponentState';
import { TicketSearchContext } from '../../../../../ticket/webapp/core/context/TicketSearchContext';
class Component {

    private state: ComponentState;
    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Create', 'Translatable#Search'
        ]);

        const descriptors = ContextService.getInstance().getContextDescriptors(ContextMode.SEARCH);
        this.state.canShow = Array.isArray(descriptors) && descriptors.length > 0;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_CHANGED, this.subscriber);
    }

    public async searchClicked(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();
        this.search();
    }

    public searchInputClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
    }

    public keyDown(event: any): void {
        if (event.keyCode === 13 || event.key === 'Enter') {
            this.search();
        }
    }

    public async search(): Promise<void> {
        const element = (this as any).getEl('searchObjectInput');
        if (element.value) {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Search' }
            );

            const context = ContextService.getInstance().getActiveContext();

            const searchDescriptors = ContextService.getInstance().getContextDescriptors(ContextMode.SEARCH);
            const searchContextDescriptor = searchDescriptors.find(
                (sd) => sd.kixObjectTypes.some((ot) => ot === context.descriptor.kixObjectTypes[0])
            );
            const hasTicketSearchContext = searchDescriptors.some(
                (sd) => sd.contextId === TicketSearchContext.CONTEXT_ID
            );

            let contextId: string = searchContextDescriptor?.contextId;
            if (!searchContextDescriptor && hasTicketSearchContext) {
                contextId = TicketSearchContext.CONTEXT_ID;
            } else if (!searchContextDescriptor && searchDescriptors.length) {
                contextId = searchDescriptors[0].contextId;
            }

            if (searchContextDescriptor || contextId) {
                const descriptor = searchContextDescriptor || ContextService.getInstance().getContextDescriptor(
                    contextId
                );
                if (descriptor && element) {
                    await SearchService.getInstance().executePrimarySearch(
                        descriptor.kixObjectTypes[0], element.value
                    ).catch((error) => {
                        OverlayService.getInstance().openOverlay(
                            OverlayType.WARNING, null, new StringContent(error), 'Translatable#Search error!',
                            null, true
                        );
                    });
                }
            }
        }
    }

    public searchValueChanged(event: any, externalFilterText?: string): void {
        this.state.searchValue = event ? event.target.value : externalFilterText;
    }

}

module.exports = Component;
