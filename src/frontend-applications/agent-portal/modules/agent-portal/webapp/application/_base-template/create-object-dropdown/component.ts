/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../model/Context';
import { ContextDescriptor } from '../../../../../../model/ContextDescriptor';
import { ContextMode } from '../../../../../../model/ContextMode';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXStyle } from '../../../../../base-components/model/KIXStyle';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextEvents } from '../../../../../base-components/webapp/core/ContextEvents';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {
    private values: Array<[string, string, string | ObjectIcon]>;

    public onCreate(input: any): void {
        super.onCreate(input, 'create-object-dropdown');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Create'
        ]);

        this.values = [];
        const descriptors = ContextService.getInstance().getContextDescriptors(ContextMode.CREATE);
        for (const cd of descriptors) {
            const displayText = await TranslationService.translate(cd.displayText);
            this.values.push([cd.contextId, displayText, cd.icon]);
        }

        if (this.values.length) {
            this.setValues(descriptors);
        }

        super.registerEventSubscriber(
            function (data: Context, eventId: string): void {
                this.setValues(descriptors, data?.descriptor);
            },
            [ContextEvents.CONTEXT_CHANGED]
        );

        this.state.prepared = true;
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    public async valueClicked(value: [string, string, string | ObjectIcon], event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();
        ContextService.getInstance().setActiveContext(value[0]);
    }

    private setValues(
        descriptors: ContextDescriptor[],
        currentDescriptor: ContextDescriptor = this.context?.descriptor
    ): void {
        let createDescriptor = descriptors.find((d) => d.kixObjectTypes[0] === currentDescriptor?.kixObjectTypes[0]);
        if (!createDescriptor) {
            createDescriptor = descriptors.find((d) => d.kixObjectTypes[0] === KIXObjectType.TICKET);
        }

        if (createDescriptor) {
            this.state.selectedValue = this.values.find((v) => v[0] === createDescriptor.contextId);
        } else {
            this.state.selectedValue = this.values[0];
        }

        if (window.innerWidth > KIXStyle.MOBILE_BREAKPOINT) {
            this.state.values = this.values.filter((v) => v[0] !== this.state.selectedValue[0]);
        } else {
            this.state.values = this.values;
        }
    }


    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
