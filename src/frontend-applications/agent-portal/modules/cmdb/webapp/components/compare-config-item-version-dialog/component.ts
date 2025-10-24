/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { CompareConfigItemVersionContext } from '../../core';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState, CompareConfigItemVersionContext> {

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

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


    public onDestroy(): void {
        super.onDestroy();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
