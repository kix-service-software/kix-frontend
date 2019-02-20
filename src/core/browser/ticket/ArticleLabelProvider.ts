import { ILabelProvider } from "..";
import { Article, ArticleProperty, DateTimeUtil, ObjectIcon, KIXObjectType, Channel } from "../../model";
import { KIXObjectService } from "../kix";

export class ArticleLabelProvider implements ILabelProvider<Article> {

    public kixObjectType: KIXObjectType = KIXObjectType.ARTICLE;

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public async getPropertyText(property: string): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ArticleProperty.TO:
                displayValue = 'An';
                break;
            case ArticleProperty.CC:
                displayValue = 'Cc';
                break;
            case ArticleProperty.BCC:
                displayValue = 'Bcc';
                break;
            case ArticleProperty.ARTICLE_INFORMATION:
                displayValue = 'Neu';
                break;
            case ArticleProperty.NUMBER:
                displayValue = 'Nr.';
                break;
            case ArticleProperty.CUSTOMER_VISIBLE:
                displayValue = 'Sichtbar in Kundenportal';
                break;
            case ArticleProperty.SENDER_TYPE_ID:
                displayValue = 'Senderobjekt';
                break;
            case ArticleProperty.FROM:
                displayValue = 'Von';
                break;
            case ArticleProperty.SUBJECT:
                displayValue = 'Betreff';
                break;
            case ArticleProperty.INCOMING_TIME:
                displayValue = 'Erstellt am';
                break;
            case ArticleProperty.ATTACHMENTS:
                displayValue = 'Anlagen';
                break;
            case ArticleProperty.CHANNEL_ID:
                displayValue = 'Typ';
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        if (property === ArticleProperty.CUSTOMER_VISIBLE) {
            return 'kix-icon-flag';
        }
        return;
    }

    public async getDisplayText(article: Article, property: string, defaultValue?: string): Promise<string> {
        let displayValue;
        switch (property) {
            case ArticleProperty.FROM:
            case ArticleProperty.SUBJECT:
                displayValue = article[property];
                break;

            case ArticleProperty.SENDER_TYPE_ID:
                if (article.senderType) {
                    displayValue = article.senderType.Name;
                }
                break;

            case ArticleProperty.ARTICLE_TAG:
                displayValue = '';
                break;

            case ArticleProperty.INCOMING_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(article[property] * 1000);
                break;

            case ArticleProperty.ATTACHMENTS:
                displayValue = '';
                if (article.Attachments) {
                    const attachments = article.Attachments.filter((a) => a.Disposition !== 'inline');
                    if (attachments.length > 0) {
                        displayValue = '(' + attachments.length + ')';
                    }
                }
                break;

            case ArticleProperty.TO:
                displayValue = article.toList.length ? article.toList[0].email : '';
                break;

            case ArticleProperty.CC:
                displayValue = article.ccList.length ? article.ccList[0].email : '';
                break;

            case ArticleProperty.BCC:
                displayValue = article.bccList.length ? article.bccList[0].email : '';
                break;

            case ArticleProperty.ARTICLE_INFORMATION:
                displayValue = article.isUnread() ? 'ungelesen' : 'gelesen';
                break;

            case ArticleProperty.CHANNEL_ID:
                const channels = await KIXObjectService.loadObjects<Channel>(KIXObjectType.CHANNEL, null);
                if (channels) {
                    const channel = channels.find((c) => c.ID === article.ChannelID);
                    displayValue = channel ? channel.Name : article[property];
                }
                break;

            case ArticleProperty.CUSTOMER_VISIBLE:
                displayValue = 'Sichtbar in Kundenportal';
                break;

            default:
                displayValue = defaultValue ? defaultValue : article[property];
        }
        return displayValue;
    }

    public getDisplayTextClasses(article: Article, property: string): string[] {
        const classes = [];
        if (property === ArticleProperty.ARTICLE_INFORMATION && article.isUnread()) {
            classes.push('unseen');
        }
        return classes;
    }

    public getObjectClasses(article: Article): string[] {
        const classes = [];
        if (article.isUnread()) {
            classes.push('article-unread');
        }
        return classes;
    }

    public isLabelProviderFor(article: Article): boolean {
        return article instanceof Article;
    }

    public async getObjectText(article: Article): Promise<string> {
        return article.Subject;
    }

    public getObjectAdditionalText(article: Article): string {
        return "";
    }

    public getObjectIcon(article: Article): string | ObjectIcon {
        return null;
    }

    public getObjectTooltip(article: Article): string {
        return article.Subject;
    }

    public getObjectName(): string {
        return "Artikel";
    }

    public async getIcons(article: Article, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        switch (property) {
            case ArticleProperty.ATTACHMENTS:
                if (article.Attachments) {
                    const attachments = article.Attachments.filter((a) => a.Disposition !== 'inline');
                    if (attachments.length > 0) {
                        icons.push('kix-icon-attachement');
                    }
                }
                break;
            case ArticleProperty.ARTICLE_INFORMATION:
                if (article.isUnread()) {
                    icons.push('kix-icon-info');
                }
                break;
            case ArticleProperty.CHANNEL_ID:
                icons.push(new ObjectIcon('Channel', article.ChannelID));
                break;
            case ArticleProperty.CUSTOMER_VISIBLE:
                if (article.CustomerVisible) {
                    icons.push('kix-icon-flag');
                }
                break;
            default:
        }
        return icons;
    }

}
