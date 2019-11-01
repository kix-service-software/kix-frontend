/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject, FormFieldValue, } from "../../model";
import { IKIXService } from "./IKIXService";
import { FormConfiguration, FormFieldConfiguration } from "../../model/components/form/configuration";

export interface IKIXObjectFormService<T extends KIXObject = KIXObject> extends IKIXService {

    initValues(form: FormConfiguration): Promise<Map<string, FormFieldValue<any>>>;

    initOptions(form: FormConfiguration): Promise<void>;

    getNewFormField(formField: FormFieldConfiguration): FormFieldConfiguration;

}
