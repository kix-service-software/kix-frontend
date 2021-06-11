/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { CompareConfigItemVersionContext } from '../../core';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';

class Component {

    private state: ComponentState;

    private context: CompareConfigItemVersionContext;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Close Dialog'
        ]);

        this.context = ContextService.getInstance().getActiveContext();

        const versions = await this.context.getObjectList(KIXObjectType.CONFIG_ITEM_VERSION);
        if (versions) {
            const text = await TranslationService.translate('Translatable#Selected Versions', []);
            this.state.title = `${text} (${versions.length})`;
        }

        this.state.compareWidget = await this.context.getWidgetConfiguration('compare-ci-version-widget');
    }

    public getCompareWidgetTemplate(instanceId: string): any {
        return KIXModulesService.getComponentTemplate(this.state.compareWidget.widgetId);
    }

}

module.exports = Component;
