/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../model/Context';
import { ContextMode } from '../../../../../../model/ContextMode';
import { SortUtil } from '../../../../../../model/SortUtil';
import { ContextEvents } from '../../../../../base-components/webapp/core/ContextEvents';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { ComponentState } from './ComponentState';

class Component {

    private state: ComponentState;
    private subscriber: IEventSubscriber;
    private values: Array<[string, string, string | ObjectIcon]>;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Create'
        ]);

        this.values = [];
        const descriptors = ContextService.getInstance().getContextDescriptors(ContextMode.CREATE);
        for (const cd of descriptors) {
            const displayText = await TranslationService.translate(cd.displayText);
            this.values.push([cd.contextId, displayText, cd.icon]);
        }
        this.values = this.values.sort((a, b) => SortUtil.compareString(a[1], b[1]));

        if (this.values.length) {
            this.state.selectedValue = this.values[0];
            if (window.innerWidth > 1024) {
                this.state.values = this.values.filter((v) => v[0] !== this.state.selectedValue[0]);
            } else {
                this.state.values = this.values;
            }
        }

        this.subscriber = {
            eventSubscriberId: 'new-object-dropdown',
            eventPublished: (data: Context, eventId: string) => {
                if (eventId === ContextEvents.CONTEXT_CHANGED) {
                    const descriptor = descriptors.find(
                        (d) => d.kixObjectTypes[0] === data.descriptor.kixObjectTypes[0]
                    );
                    if (descriptor) {
                        const value = this.values.find((v) => v[0] === descriptor.contextId);
                        if (value) {
                            this.state.selectedValue = value;
                        }
                    }
                }
            }
        };
        EventService.getInstance().subscribe(ContextEvents.CONTEXT_CHANGED, this.subscriber);
        this.state.prepared = true;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_CHANGED, this.subscriber);
    }

    public async valueClicked(value: [string, string, string | ObjectIcon], event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();
        this.state.selectedValue = value;
        if (window.innerWidth > 1024) {
            this.state.values = this.values.filter((v) => v[0] !== this.state.selectedValue[0]);
        } else {
            this.state.values = this.values;
        }
        ContextService.getInstance().setActiveContext(value[0]);
    }

}

module.exports = Component;
