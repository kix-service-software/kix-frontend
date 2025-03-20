/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';

import { AdditionalTableObjectsHandlerConfiguration } from './AdditionalTableObjectsHandlerConfiguration';

export interface IAdditionalTableObjectsHandler {

    handlerId: string;

    objectType: KIXObjectType;

    determineObjects(
        handlerConfig: AdditionalTableObjectsHandlerConfiguration, loadingOptions?: KIXObjectLoadingOptions
    ): Promise<KIXObject[]>;

}
