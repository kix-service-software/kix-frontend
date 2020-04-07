/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FAQLabelProvider } from '../../../core';
import { FAQDetailsContext } from '../../../core/context/FAQDetailsContext';
import { IdService } from '../../../../../../model/IdService';
import { FAQArticleProperty } from '../../../../model/FAQArticleProperty';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { FAQArticle } from '../../../../model/FAQArticle';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../../../modules/base-components/webapp/core/ActionFactory';
import { Label } from '../../../../../../modules/base-components/webapp/core/Label';
import { Context } from '../../../../../../model/Context';

class Component {

    private state: ComponentState;
    private contextListenerId: string = null;

    public labelProvider: FAQLabelProvider = new FAQLabelProvider();

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListenerId = IdService.generateDateBasedId('faq-info-widget');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.labelProvider = new FAQLabelProvider();

        const context = await ContextService.getInstance().getContext<FAQDetailsContext>(FAQDetailsContext.CONTEXT_ID);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, faqArticle: FAQArticle, type: KIXObjectType | string) => {
                if (type === KIXObjectType.FAQ_ARTICLE) {
                    this.initWidget(context, faqArticle);
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            additionalInformationChanged: () => { return; }
        });

        await this.initWidget(context, await context.getObject<FAQArticle>());
    }

    private async initWidget(context: Context, faqArticle?: FAQArticle): Promise<void> {
        this.state.loading = true;

        this.state.faqArticle = faqArticle ? faqArticle : await context.getObject<FAQArticle>();
        this.prepareActions();
        this.createLabels();

        setTimeout(() => {
            this.state.loading = false;
        }, 50);
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.faqArticle) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.faqArticle]
            );
        }
    }

    private createLabels(): void {
        this.state.labels = this.state.faqArticle.Keywords.map(
            (k) => new Label(null, k, null, k, null, k, false)
        );
    }

}

module.exports = Component;
