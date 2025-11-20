/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ConfigItemClassDefinition } from '../../../model/ConfigItemClassDefinition';

class Component extends AbstractMarkoComponent<ComponentState> {

    private definition: ConfigItemClassDefinition;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.definition = input.definition;

    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.definitionString = this.definition ? this.definition.DefinitionString : '';
        const area = (this as any).getEl();
        if (area) {
            setTimeout(() => {
                area.style.cssText = 'height:auto; padding:0';
                area.style.cssText = 'height:' + (area.scrollHeight + 10) + 'px';
            }, 10);
        }
    }


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
