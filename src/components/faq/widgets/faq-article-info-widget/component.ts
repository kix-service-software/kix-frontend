/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService, ActionFactory, IdService } from '../../../../core/browser';
import { KIXObjectType, Context } from '../../../../core/model';
import { FAQArticle, FAQArticleProperty } from '../../../../core/model/kix/faq';
import { FAQLabelProvider } from '../../../../core/browser/faq';
import { Label } from '../../../../core/browser/components';
import { FAQDetailsContext } from '../../../../core/browser/faq/context/FAQDetailsContext';

class Component {

    private state: ComponentState;
    private contextListenerId: string = null;

    public labelProvider: FAQLabelProvider = new FAQLabelProvider();
    public properties;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListenerId = IdService.generateDateBasedId('faq-info-widget');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.labelProvider = new FAQLabelProvider();
        this.properties = FAQArticleProperty;

        const context = await ContextService.getInstance().getContext<FAQDetailsContext>(FAQDetailsContext.CONTEXT_ID);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, faqArticle: FAQArticle, type: KIXObjectType) => {
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
