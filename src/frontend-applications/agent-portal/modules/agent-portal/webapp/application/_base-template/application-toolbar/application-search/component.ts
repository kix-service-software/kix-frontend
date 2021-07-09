/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextMode } from '../../../../../../../model/ContextMode';
import { SortUtil } from '../../../../../../../model/SortUtil';
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
        const descriptors = ContextService.getInstance().getContextDescriptors(ContextMode.SEARCH);
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
