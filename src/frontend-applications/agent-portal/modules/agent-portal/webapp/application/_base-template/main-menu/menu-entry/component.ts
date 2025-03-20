/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent
} from '../../../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { RoutingConfiguration } from '../../../../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../../../../model/ContextMode';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.entry = input.entry;
    }

    public getRoutingConfiguration(): RoutingConfiguration {
        return this.state.entry
            ? new RoutingConfiguration(this.state.entry.mainContextId, null, ContextMode.DASHBOARD, null)
            : null;
    }


}

module.exports = Component;
