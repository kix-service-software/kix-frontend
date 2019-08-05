/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../../model";

export interface IPlaceholderHandler {

    handlerId: string;

    isHandlerFor(objectString: string): boolean;

    replace(placeholder: string, object?: KIXObject, language?: string): Promise<string>;

}
