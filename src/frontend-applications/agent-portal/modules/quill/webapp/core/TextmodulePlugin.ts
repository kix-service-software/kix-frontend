import { PlaceholderService } from '../../../base-components/webapp/core/PlaceholderService';
import { TextModuleService } from '../../../textmodule/webapp/core';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';


export class TextmodulePlugin {
    public static readonly TRIGGER = '::';

    public static async fetchSuggestions(query: string): Promise<any[]> {
        const service = await TextModuleService.getInstance();
        const modules = await service.searchTextModules(query);

        const results = await Promise.all(modules.map(async (mod) => {
            const name = await TranslationService.translate(mod.Name);
            return {
                id: String(mod.ID),
                label: name,
                content: mod.Text,
                keywords: mod.Keywords?.join(', ') || '',
                language: mod.Language
            };
        }));

        return results.slice(0, 5);
    }

    public static async prepareTextContent(textmodule: any): Promise<string> {
        return PlaceholderService.getInstance().replacePlaceholders(
            textmodule.content,
            null,
            textmodule.language
        );
    }
}