/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { SysConfigOptionDefinition } from '../../model/SysConfigOptionDefinition';
import { PlaceholderService } from '../../../../modules/base-components/webapp/core/PlaceholderService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SysConfigOptionType } from '../../model/SysConfigOptionType';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { AbstractPlaceholderHandler } from '../../../base-components/webapp/core/AbstractPlaceholderHandler';

export class SysConfigPlaceholderHandler extends AbstractPlaceholderHandler {

    public handlerId: string = '010-SysConfigPlaceholderHandler';
    protected objectStrings: string[] = [
        'CONFIG'
    ];

    public async replace(placeholder: string, object?: KIXObject, language?: string): Promise<string> {
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
                case SysConfigOptionType.HASH:
                    const optionString: string = PlaceholderService.getInstance().getOptionsString(placeholder);
                    if (optionString && typeof value[optionString] === 'string') {
                        result = value[optionString];
                    }
                    // special handling for <KIX_CONFIG_FQDN> (without optionString)
                    else if (sysConfigName === 'FQDN') {
                        result = value['Frontend'] || null;
                    }
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
