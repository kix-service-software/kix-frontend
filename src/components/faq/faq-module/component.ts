/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../core/browser';
import { ConfiguredWidget } from '../../../core/model';
import { KIXModulesService } from '../../../core/browser/modules';
import { FAQContext } from '../../../core/browser/faq/context/FAQContext';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (await ContextService.getInstance().getContext(FAQContext.CONTEXT_ID) as FAQContext);
        this.state.contentWidgets = context.getContent();
        if (!context.faqCategory) {
            context.setFAQCategory(null);
        }
    }

    public getTemplate(widget: ConfiguredWidget): any {
        return KIXModulesService.getComponentTemplate(widget.configuration.widgetId);
    }

}

module.exports = Component;
