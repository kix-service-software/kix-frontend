import { ILabelProvider } from "..";
import {
    DateTimeUtil, ObjectIcon, KIXObjectType, KIXObject, SysConfigItem, SysConfigKey
} from "../../model";
import { ContextService } from "../context";
import { FAQArticleProperty, FAQArticle, FAQCategory } from "../../model/kix/faq";
import { KIXObjectService, ServiceRegistry } from "../kix";
import { BrowserUtil } from "../BrowserUtil";
import { SearchProperty } from "../SearchProperty";
import { TranslationService } from "../i18n/TranslationService";

export class FAQLabelProvider implements ILabelProvider<FAQArticle> {

    public kixObjectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE;

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        let displayValue = value;
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            switch (property) {
                case FAQArticleProperty.CATEGORY_ID:
                    const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(KIXObjectType.FAQ_CATEGORY);
                    const catgeory = faqCategories.find((fc) => fc.ID === value);
                    displayValue = catgeory ? catgeory.Name : value;
                    break;
                case FAQArticleProperty.VALID_ID:
                    const valid = objectData.validObjects.find((v) => v.ID === value);
                    displayValue = valid ? valid.Name : value;
                    break;
                default:
                    displayValue = value;
            }
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyText(property: string): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Volltext';
                break;
            case FAQArticleProperty.APPROVED:
                displayValue = 'Genehmigt';
                break;
            case FAQArticleProperty.ATTACHMENTS:
                displayValue = 'Anlagen';
                break;
            case FAQArticleProperty.CATEGORY_ID:
                displayValue = 'Kategorie';
                break;
            case FAQArticleProperty.CHANGED:
                displayValue = 'Geändert am';
                break;
            case FAQArticleProperty.CHANGED_BY:
                displayValue = 'Geändert von';
                break;
            case FAQArticleProperty.CREATED:
                displayValue = 'Erstellt am';
                break;
            case FAQArticleProperty.CREATED_BY:
                displayValue = 'Erstellt von';
                break;
            case FAQArticleProperty.FIELD_1:
                displayValue = 'Symptom';
                break;
            case FAQArticleProperty.FIELD_2:
                displayValue = 'Ursache';
                break;
            case FAQArticleProperty.FIELD_3:
                displayValue = 'Lösung';
                break;
            case FAQArticleProperty.FIELD_6:
                displayValue = 'Kommentar';
                break;
            case FAQArticleProperty.HISTORY:
                displayValue = 'Historie';
                break;
            case FAQArticleProperty.ID:
                displayValue = 'Id';
                break;
            case FAQArticleProperty.KEYWORDS:
                displayValue = 'Schlagwörter';
                break;
            case FAQArticleProperty.LANGUAGE:
                displayValue = 'Sprache';
                break;
            case FAQArticleProperty.LINK:
                displayValue = 'Verknüpfungen';
                break;
            case FAQArticleProperty.NUMBER:
                const hookConfig = await KIXObjectService.loadObjects<SysConfigItem>(
                    KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.FAQ_HOOK]
                ).catch((error) => []);
                if (hookConfig && hookConfig.length) {
                    displayValue = hookConfig[0].Data;
                }
                break;
            case FAQArticleProperty.TITLE:
                displayValue = 'Titel';
                break;
            case FAQArticleProperty.VALID_ID:
                displayValue = 'Gültigkeit';
                break;
            case FAQArticleProperty.VISIBILITY:
                displayValue = 'Sichtbarkeit';
                break;
            case FAQArticleProperty.VOTES:
                displayValue = 'Bewertung';
                break;
            case 'LinkedAs':
                displayValue = 'Verknüpft als';
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(faqArticle: FAQArticle, property: string): Promise<string> {
        let displayValue = faqArticle[property];

        const objectData = ContextService.getInstance().getObjectData();

        switch (property) {
            case FAQArticleProperty.CATEGORY_ID:
                const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(KIXObjectType.FAQ_CATEGORY);
                const catgeory = faqCategories.find((fc) => fc.ID === displayValue);
                displayValue = catgeory ? catgeory.Name : displayValue;
                break;
            case FAQArticleProperty.CREATED:
            case FAQArticleProperty.CHANGED:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case FAQArticleProperty.VOTES:
                displayValue = '';
                if (faqArticle.Votes && faqArticle.Votes.length) {
                    const average = BrowserUtil.calculateAverage(faqArticle.Votes.map((v) => v.Rating));
                    displayValue = `(${average})`;
                }
                break;
            case FAQArticleProperty.CREATED_BY:
                displayValue = faqArticle.createdBy ? faqArticle.createdBy.UserFullname : faqArticle.CreatedBy;
                break;
            case FAQArticleProperty.CHANGED_BY:
                displayValue = faqArticle.changedBy ? faqArticle.changedBy.UserFullname : faqArticle.ChangedBy;
                break;
            case FAQArticleProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID.toString() === faqArticle.ValidID.toString());
                displayValue = valid ? valid.Name : faqArticle.ValidID;
                break;
            case FAQArticleProperty.LANGUAGE:
                const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
                    KIXObjectType.TRANSLATION
                );
                displayValue = await translationService.getLanguageName(faqArticle.Language);
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(faqArticle: FAQArticle, property: string): string[] {
        return [];
    }

    public getObjectClasses(faqArticle: FAQArticle): string[] {
        return [];
    }

    public isLabelProviderFor(faqArticle: FAQArticle): boolean {
        return faqArticle instanceof FAQArticle;
    }

    public async getObjectText(faqArticle: FAQArticle, id: boolean = true, title: boolean = true): Promise<string> {
        let returnString = '';
        if (faqArticle) {
            if (id) {
                let faqHook: string = '';

                const hookConfig = await KIXObjectService.loadObjects<SysConfigItem>(
                    KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.FAQ_HOOK]
                ).catch((error) => []);

                if (hookConfig && hookConfig.length) {
                    faqHook = hookConfig[0].Data;
                }

                returnString = `${faqHook}${faqArticle.Number}`;
            }
            if (title) {
                returnString += (id ? " - " : '') + faqArticle.Title;
            }

        } else {
            returnString = 'FAQ-Article';
        }
        return returnString;
    }

    public getObjectAdditionalText(faqArticle: FAQArticle): string {
        return null;
    }

    public getObjectIcon(faqArticle: FAQArticle): string | ObjectIcon {
        return 'kix-icon-faq';
    }

    public getObjectTooltip(faqArticle: FAQArticle): string {
        return faqArticle.Title;
    }

    public getObjectName(): string {
        return "FAQ";
    }

    public async getIcons(
        faqArticle: FAQArticle, property: string, value?: number | string
    ): Promise<Array<string | ObjectIcon>> {
        const icons = [];

        if (faqArticle) {
            value = faqArticle[property];
        }

        switch (property) {
            case FAQArticleProperty.VOTES:
                if (faqArticle.Votes && faqArticle.Votes.length) {
                    const average = BrowserUtil.calculateAverage(faqArticle.Votes.map((v) => v.Rating));
                    for (let i = 0; i < Math.floor(average); i++) {
                        icons.push('kix-icon-star-fully');
                    }
                    if ((average % 1) !== 0) {
                        icons.push('kix-icon-star-half');
                    }
                }
                break;
            case FAQArticleProperty.VISIBILITY:
                icons.push(new ObjectIcon(FAQArticleProperty.VISIBILITY, value));
                break;
            default:
        }

        return icons;
    }

}
