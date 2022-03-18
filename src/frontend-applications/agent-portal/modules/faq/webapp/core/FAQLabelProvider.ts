/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { FAQArticle } from '../../model/FAQArticle';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FAQArticleProperty } from '../../model/FAQArticleProperty';
import { FAQCategory } from '../../model/FAQCategory';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { BrowserUtil } from '../../../../modules/base-components/webapp/core/BrowserUtil';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { FAQVote } from '../../model/FAQVote';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class FAQLabelProvider extends LabelProvider<FAQArticle> {

    public kixObjectType: KIXObjectType | string = KIXObjectType.FAQ_ARTICLE;

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue;
        switch (property) {
            case FAQArticleProperty.CATEGORY_ID:
                const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(KIXObjectType.FAQ_CATEGORY);
                const category = faqCategories.find((fc) => fc.ID === value);
                displayValue = category ? category.Name : value;
                break;
            case FAQArticleProperty.VOTES:
                displayValue = value.toString();
                break;
            case FAQArticleProperty.CUSTOMER_VISIBLE:
                displayValue = value ? 'Translatable#Yes' : 'Translatable#No';
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case FAQArticleProperty.APPROVED:
                displayValue = 'Translatable#Approved';
                break;
            case FAQArticleProperty.ATTACHMENTS:
                displayValue = 'Translatable#Attachments';
                break;
            case FAQArticleProperty.CATEGORY_ID:
                displayValue = 'Translatable#Category';
                break;
            case FAQArticleProperty.CUSTOMER_VISIBLE:
                displayValue = 'Translatable#Show in Customer Portal';
                break;
            case FAQArticleProperty.FIELD_1:
                displayValue = 'Translatable#Symptom';
                break;
            case FAQArticleProperty.FIELD_2:
                displayValue = 'Translatable#Cause';
                break;
            case FAQArticleProperty.FIELD_3:
                displayValue = 'Translatable#Solution';
                break;
            case FAQArticleProperty.FIELD_6:
                displayValue = 'Translatable#Comment';
                break;
            case FAQArticleProperty.HISTORY:
                displayValue = 'Translatable#History';
                break;
            case FAQArticleProperty.ID:
                displayValue = 'Translatable#Id';
                break;
            case FAQArticleProperty.KEYWORDS:
                displayValue = 'Translatable#Tags';
                break;
            case FAQArticleProperty.LANGUAGE:
                displayValue = 'Translatable#Language';
                break;
            case FAQArticleProperty.LINK:
                displayValue = 'Translatable#Links';
                break;
            case FAQArticleProperty.NUMBER:
                const hookConfig: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.FAQ_HOOK], null, null, true
                ).catch((error): SysConfigOption[] => []);
                if (hookConfig && hookConfig.length) {
                    displayValue = hookConfig[0].Value;
                }
                break;
            case FAQArticleProperty.TITLE:
                displayValue = 'Translatable#Title';
                break;
            case FAQArticleProperty.VOTES:
                displayValue = 'Translatable#Rating';
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getDisplayText(
        faqArticle: FAQArticle, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = faqArticle[property];

        switch (property) {
            case FAQArticleProperty.CATEGORY_ID:
                const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(KIXObjectType.FAQ_CATEGORY);
                const category = faqCategories.find((fc) => fc.ID === displayValue);
                displayValue = category ? category.Name : displayValue;
                break;
            case FAQArticleProperty.VOTES:
                displayValue = '';
                if (faqArticle.Votes && faqArticle.Votes.length) {
                    const average = BrowserUtil.calculateAverage(faqArticle.Votes.map((v) => v.Rating));
                    displayValue = `(${average})`;
                }
                break;
            case FAQArticleProperty.LANGUAGE:
                const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
                    KIXObjectType.TRANSLATION_PATTERN
                );
                displayValue = await translationService.getLanguageName(faqArticle.Language);
                break;
            default:
                displayValue = await super.getDisplayText(faqArticle, property, defaultValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(object: FAQArticle | KIXObject): boolean {
        return object instanceof FAQArticle || object?.KIXObjectType === this.kixObjectType;
    }

    public async getObjectText(faqArticle: FAQArticle, id: boolean = true, title: boolean = true): Promise<string> {
        let returnString = '';
        if (faqArticle) {
            if (id) {
                let faqHook: string = '';

                const hookConfig: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.FAQ_HOOK]
                ).catch((error): SysConfigOption[] => []);

                if (hookConfig && hookConfig.length) {
                    faqHook = hookConfig[0].Value;
                }

                returnString = `${faqHook}${faqArticle.Number}`;
            }
            if (title) {
                returnString += (id ? ' - ' : '') + faqArticle.Title;
            }

        } else {
            returnString = await TranslationService.translate('Translatable#FAQ Article');
        }
        return returnString;
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-faq';
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        if (property === FAQArticleProperty.CUSTOMER_VISIBLE) {
            return 'kix-icon-men';
        }
        return;
    }

    public async getObjectTooltip(faqArticle: FAQArticle, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(faqArticle.Title);
        }
        return faqArticle.Title;
    }

    public async getObjectName(): Promise<string> {
        return 'FAQ';
    }

    public async getIcons(
        faqArticle: FAQArticle, property: string, value?: any, forTable: boolean = false
    ): Promise<Array<string | ObjectIcon>> {
        const icons = [];

        if (faqArticle) {
            value = faqArticle[property];
        }

        switch (property) {
            case FAQArticleProperty.VOTES:
                if (faqArticle && faqArticle.Votes && faqArticle.Votes.length) {
                    const average = BrowserUtil.calculateAverage(faqArticle.Votes.map((v) => v.Rating));
                    for (let i = 0; i < Math.floor(average); i++) {
                        icons.push('kix-icon-star-fully');
                    }
                    if ((average % 1) !== 0) {
                        icons.push('kix-icon-star-half');
                    }
                } else if (value instanceof FAQVote) {
                    const rating = value.Rating;
                    for (let i = 0; i < rating; i++) {
                        icons.push('kix-icon-star-fully');
                    }
                }
                break;
            case FAQArticleProperty.CUSTOMER_VISIBLE:
                if (value) {
                    icons.push('kix-icon-check');
                } else if (!forTable) {
                    icons.push('kix-icon-close');
                }
                break;
            case FAQArticleProperty.CATEGORY_ID:
                if (faqArticle) {
                    icons.push(new ObjectIcon(null, KIXObjectType.FAQ_CATEGORY, faqArticle.CategoryID));
                }
                break;
            default:
        }

        return icons;
    }

}
