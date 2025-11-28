/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TextModuleService } from '../../../textmodule/webapp/core';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { PlaceholderService } from '../../../base-components/webapp/core/PlaceholderService';

export class TextmodulePlugin {
    public static readonly TRIGGER = '::';

    public static async fetchSuggestions(query: string): Promise<any[]> {
        const service = await TextModuleService.getInstance();
        const modules = await service.searchTextModules(query);

        const results = await Promise.all(
            modules.map(async (mod) => {
                const name = await TranslationService.translate(mod.Name);
                return {
                    id: String(mod.ID),
                    label: name,
                    content: mod.Text,
                    keywords: mod.Keywords?.join(', ') || '',
                    language: mod.Language,
                };
            }),
        );

        return results;
    }

    public static async prepareTextContent(textmodule: any): Promise<string> {
        try {
            const placeholderService = await PlaceholderService.getInstance();
            const replaced = await placeholderService.replacePlaceholders(
                textmodule.content,
                null,
                textmodule.language,
                true,
            );
            return replaced;
        } catch (e) {
            console.error('[TextmodulePlugin] Error preparing text content:', e);
            return textmodule.content;
        }
    }
}