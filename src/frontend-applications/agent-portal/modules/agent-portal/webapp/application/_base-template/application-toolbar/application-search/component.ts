/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextMode } from '../../../../../../../model/ContextMode';
import { AbstractMarkoComponent } from '../../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../../base-components/webapp/core/ContextService';
import { ObjectIcon } from '../../../../../../icon/model/ObjectIcon';
import { TranslationService } from '../../../../../../translation/webapp/core/TranslationService';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.title = await TranslationService.translate('Translatable#Search menu');
        const descriptors = ContextService.getInstance().getContextDescriptors(ContextMode.SEARCH);
        this.state.canShow = Array.isArray(descriptors) && descriptors.length > 0;
        for (const cd of descriptors) {
            const displayText = await TranslationService.translate(cd.displayText);
            this.state.values.push([cd.contextId, displayText, cd.icon]);
        }
        (this as any).setStateDirty('values');
    }

    public valueClicked(value: [string, string, string | ObjectIcon]): void {
        ContextService.getInstance().setActiveContext(value[0]);
    }

}

module.exports = Component;
