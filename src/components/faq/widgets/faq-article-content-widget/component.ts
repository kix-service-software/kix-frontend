import { KIXObjectType, WidgetType, KIXObjectLoadingOptions, ObjectIcon, Context } from "@kix/core/dist/model";
import {
    ContextService, ActionFactory, WidgetService, BrowserUtil, IdService, KIXObjectService, LabelService
} from "@kix/core/dist/browser";
import { ComponentState } from './ComponentState';
import {
    FAQArticle, Attachment, FAQArticleAttachmentLoadingOptions, FAQArticleProperty
} from "@kix/core/dist/model/kix/faq";

class Component {

    public eventSubscriberId: string = 'FAQContentComponent';

    private state: ComponentState;
    private contextListenerId: string = null;

    private stars: Array<string | ObjectIcon> = [];
    private rating: number;

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

        await this.initWidget(context, await context.getObject<FAQArticle>());
        this.state.loading = false;
    }

    private async initWidget(context: Context, faqArticle?: FAQArticle): Promise<void> {
        this.state.faqArticle = faqArticle;

        if (faqArticle) {
            const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.FAQ_ARTICLE);
            this.stars = await labelProvider.getIcons(faqArticle, FAQArticleProperty.VOTES);
            this.rating = BrowserUtil.calculateAverage(faqArticle.Votes.map((v) => v.Rating));
            this.setActions();
        }
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.faqArticle) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.faqArticle]
            );
        }
    }

    public getRatingTooltip(): string {
        const count = this.state.faqArticle.Votes ? this.state.faqArticle.Votes.length : 0;
        return `Anzahl Bewertungen: ${count}`;
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
        const attachments = await KIXObjectService.loadObjects<Attachment>(
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
