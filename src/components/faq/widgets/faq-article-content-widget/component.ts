import { KIXObjectType, WidgetType, KIXObjectLoadingOptions, ObjectIcon, Context } from "@kix/core/dist/model";
import { ContextService, ActionFactory, WidgetService, BrowserUtil, IdService } from "@kix/core/dist/browser";
import { ComponentState } from './ComponentState';
import { FAQArticle, Attachment, FAQArticleAttachmentLoadingOptions } from "@kix/core/dist/model/kix/faq";
import { EventService, IEventListener } from "@kix/core/dist/browser/event";
import { FAQEvent } from "@kix/core/dist/browser/faq";

class Component implements IEventListener {

    public eventSubscriberId: string = 'FAQContentComponent';

    private state: ComponentState;
    private contextListenerId: string = null;

    public onCreate(): void {
        this.state = new ComponentState();
        this.contextListenerId = IdService.generateDateBasedId('faq-content-widget');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('faq-article-group', WidgetType.GROUP);

        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        EventService.getInstance().subscribe(FAQEvent.VOTE_UPDATED, this);

        context.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, faqArticle: FAQArticle, type: KIXObjectType) => {
                if (type === KIXObjectType.FAQ_ARTICLE) {
                    this.initWidget(context, faqArticle);
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });

        this.initWidget(context);
    }

    private async initWidget(context: Context, faqArticle?: FAQArticle): Promise<void> {
        this.state.faqArticle = faqArticle
            ? faqArticle
            : await context.getObject<FAQArticle>(KIXObjectType.FAQ_ARTICLE, true);
        this.setActions();
    }

    public async eventPublished(faqArticle: FAQArticle): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        await this.initWidget(context);
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.faqArticle) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.faqArticle]
            );
        }
    }

    public getRating(): number {
        if (this.state.faqArticle && this.state.faqArticle.Votes) {
            let sum = 0;
            this.state.faqArticle.Votes.forEach((v) => sum += v.Rating);

            return this.round(sum / this.state.faqArticle.Votes.length);
        }
        return 0;
    }

    private round(value: number, step: number = 0.5): number {
        const inv = 1.0 / step;
        return Math.round(value * inv) / inv;
    }

    public getRatingTooltip(): string {
        const count = this.state.faqArticle.Votes ? this.state.faqArticle.Votes.length : 0;
        return `Anzahl Bewertungen: ${count}`;
    }

    public fillStar(index: number): boolean {
        const rating = this.getRating() * 2;
        return index <= rating;
    }

    public getIcon(attachment: Attachment): ObjectIcon {
        const fileName = attachment.Filename;
        const idx = fileName.lastIndexOf('.');
        if (idx >= 0) {
            const extension = fileName.substring(idx + 1, fileName.length);
            return new ObjectIcon("Filetype", extension);
        }
        return null;
    }

    public async download(attachment: Attachment): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, null, null, ['Content']);
        const faqArticleAttachmentOptions = new FAQArticleAttachmentLoadingOptions(
            this.state.faqArticle.ID, attachment.ID
        );
        const attachments = await ContextService.getInstance().loadObjects<Attachment>(
            KIXObjectType.FAQ_ARTICLE_ATTACHMENT, [attachment.ID], loadingOptions, faqArticleAttachmentOptions
        );

        if (attachments && attachments.length) {
            BrowserUtil.startBrowserDownload(
                attachments[0].Filename, attachments[0].Content, attachments[0].ContentType
            );
        }
    }
}

module.exports = Component;
