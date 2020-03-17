/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IPlaceholderHandler } from "../../../../modules/base-components/webapp/core/IPlaceholderHandler";
import { KIXObject } from "../../../../model/kix/KIXObject";
import { SysConfigOptionDefinition } from "../../model/SysConfigOptionDefinition";
import { PlaceholderService } from "../../../../modules/base-components/webapp/core/PlaceholderService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { SysConfigOptionType } from "../../model/SysConfigOptionType";
import { KIXObjectService } from "../../../../modules/base-components/webapp/core/KIXObjectService";
import { TranslationService } from "../../../../modules/translation/webapp/core/TranslationService";

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
