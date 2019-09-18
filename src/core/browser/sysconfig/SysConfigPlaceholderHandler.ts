/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IPlaceholderHandler, PlaceholderService } from "../placeholder";
import { KIXObjectType, KIXObject, SysConfigOptionDefinition, SysConfigOptionType } from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { KIXObjectService } from "../kix";

export class SysConfigPlaceholderHandler implements IPlaceholderHandler {

    public handlerId: string = 'SysConfigPlaceholderHandler';

    public isHandlerFor(objectString: string): boolean {
        return objectString === 'CONFIG';
    }

    public async replace(placeholder: string, object?: KIXObject, language: string = 'en'): Promise<string> {
        let result = '';
        let sysConfigOptionDef: SysConfigOptionDefinition = null;
        const sysConfigName: string = PlaceholderService.getInstance().getAttributeString(placeholder);
        if (sysConfigName) {
            const sysConfigOptionDefs: SysConfigOptionDefinition[] =
                await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
                    KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, [sysConfigName], null, null, true
                ).catch((error) => [] as SysConfigOptionDefinition[]);
            sysConfigOptionDef = sysConfigOptionDefs && !!sysConfigOptionDefs.length
                ? sysConfigOptionDefs[0] : null;
        }
        if (sysConfigOptionDef) {
            if (!PlaceholderService.getInstance().translatePlaceholder(placeholder)) {
                language = 'en';
            }
            const value = typeof sysConfigOptionDef.Value !== 'undefined'
                && sysConfigOptionDef.Value !== null && sysConfigOptionDef.Value !== ''
                ? sysConfigOptionDef.Value : sysConfigOptionDef.Default;
            switch (sysConfigOptionDef.Type) {
                case SysConfigOptionType.OPTION:
                    result = sysConfigOptionDef.Setting[value];
                    break;
                case SysConfigOptionType.STRING:
                case SysConfigOptionType.TEXTAREA:
                    result = value;
                    break;
                default:
            }
            if (typeof result !== 'undefined' && result !== null && result !== '' && language !== 'en') {
                result = await TranslationService.translate(result.toString(), undefined, language);
            }
        }
        return result;
    }
}
