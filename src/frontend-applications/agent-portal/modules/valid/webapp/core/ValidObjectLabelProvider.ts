/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { ValidObject } from '../../model/ValidObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class ValidObjectLabelProvider extends LabelProvider<ValidObject> {

    public kixObjectType: KIXObjectType | string = KIXObjectType.VALID_OBJECT;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof ValidObject || object.KIXObjectType === this.kixObjectType;
    }

    public async getObjectText(
        validObject: ValidObject, id?: boolean, title?: boolean, translatable: boolean = true): Promise<string> {
        return translatable ? await TranslationService.translate(validObject.Name) : validObject.Name;
    }

}
