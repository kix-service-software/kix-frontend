/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IPlaceholderHandler } from './IPlaceholderHandler';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { SortUtil } from '../../../../model/SortUtil';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class PlaceholderService {

    private static INSTANCE: PlaceholderService;
    private placeholderHandler: IPlaceholderHandler[] = [];

    public static getInstance(): PlaceholderService {
        if (!PlaceholderService.INSTANCE) {
            PlaceholderService.INSTANCE = new PlaceholderService();
        }

        return PlaceholderService.INSTANCE;
    }

    private constructor() { }

    public registerPlaceholderHandler(
        handler: IPlaceholderHandler
    ): void {
        const placeholderIndex = this.placeholderHandler.findIndex((ph) => ph.handlerId === handler.handlerId);
        if (placeholderIndex !== -1) {
            this.placeholderHandler[placeholderIndex] = handler;
        } else {
            this.placeholderHandler.push(handler);
        }
    }

    public unregisterPlaceholderHandler(handlerId: string): void {
        this.placeholderHandler = this.placeholderHandler.filter((ph) => ph.handlerId !== handlerId);
    }

    public extractPlaceholders(text: string): string[] {
        let placeholders: string[] = [];
        if (text && typeof text === 'string' && text !== '') {
            const result = text.match(/(<|&lt;)(TR_|NT_)?KIX_.+?(>|&gt;)/g);
            if (Array.isArray(result)) {
                placeholders = result.filter((p) => p.match(this.getPlaceholderRegex()));
            }
        }
        return placeholders;
    }

    public async replacePlaceholders(text: string, object?: KIXObject, language?: string): Promise<string> {
        const placeholders = this.extractPlaceholders(text);

        const replacedPlaceholders: Map<string, string> = new Map();

        for (const placeholder of placeholders) {
            if (!replacedPlaceholders.has(placeholder)) {
                const objectString = this.getObjectString(placeholder);
                const handler = objectString ? this.getHandler(placeholder) : null;
                if (this.doNotTranslatePlaceholder(placeholder)) {
                    language = await TranslationService.getSystemDefaultLanguage();
                }
                let replaceString = handler ? await handler.replace(placeholder, object, language) : '';
                replaceString = typeof replaceString === 'undefined' || replaceString === null ? '' : replaceString;
                replacedPlaceholders.set(placeholder, replaceString);
            }

            if (placeholders.length === 1 &&
                placeholder.endsWith('_ObjectValue>') &&
                typeof replacedPlaceholders.get(placeholder) !== 'string'
            ) {
                text = replacedPlaceholders.get(placeholder);
                break;
            } else {
                text = text.replace(placeholder, replacedPlaceholders.get(placeholder));
            }
        }

        return text;
    }

    public getHandler<T extends IPlaceholderHandler = IPlaceholderHandler>(placeholder: string): T {
        const handler = SortUtil.sortObjects(this.placeholderHandler, 'handlerId').find(
            (ph) => ph.isHandlerFor(placeholder)
        );
        return handler as T;
    }

    public getHandlerByObjectType<T extends IPlaceholderHandler = IPlaceholderHandler>(
        objectType: KIXObjectType | string
    ): T {
        const handler = this.placeholderHandler.find(
            (ph) => ph.isHandlerForObjectType(objectType)
        );
        return handler as T;
    }

    public getPlaceholderRegex(
        objectString: string = '(.+?)', attributeString: string = '(.+)', single: boolean = true
    ): RegExp {
        return new RegExp(
            `${single ? '^' : ''}(?:<|&lt;)(?:TR_|NT_)?KIX_${objectString}_${attributeString}(>|&gt;)${single ? '$' : ''}`,
            'g'
        );
    }

    public getObjectString(placeholder: string): string {
        return placeholder.replace(this.getPlaceholderRegex(), '$1');
    }

    public getAttributeString(placeholder: string): string {
        let attribute = placeholder.replace(this.getPlaceholderRegex(), '$2');
        if (attribute.match(/.+_.+/)) {
            attribute = attribute.replace(/^(.+?)_.+$/, '$1');
        }
        return attribute;
    }

    public getOptionsString(placeholder: string): string {
        const attribute = placeholder.replace(this.getPlaceholderRegex(), '$2');
        let optionsString = '';
        if (attribute.match(/.+_.+/)) {
            optionsString = attribute.replace(/^.+?_(.+)$/, '$1');
        }
        return optionsString;
    }

    public translatePlaceholder(placeholder): boolean {
        return Boolean(placeholder.match(/TR_KIX_/));
    }

    public doNotTranslatePlaceholder(placeholder): boolean {
        return Boolean(placeholder.match(/NT_KIX_/));
    }

    public isDynamicFieldAttribute(attributeString: string): boolean {
        return attributeString && Boolean(attributeString.match(/^DynamicField$/));
    }
}
