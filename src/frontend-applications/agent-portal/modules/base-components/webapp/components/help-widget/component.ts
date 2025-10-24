/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { HelpWidgetConfiguration } from '../../../../../model/configuration/HelpWidgetConfiguration';
import { AbstractMarkoComponent } from '../../core/AbstractMarkoComponent';

export class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.instanceId = input.instanceId;
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);

        const configuration = this.state.widgetConfiguration.configuration as HelpWidgetConfiguration;
        this.state.helpText = await TranslationService.translate(configuration.helpText);
        this.state.links = configuration.links;
    }

    public onDestroy(): void {
        super.onDestroy();
    }

}

module.exports = Component;
