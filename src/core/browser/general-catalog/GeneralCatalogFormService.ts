/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectService } from '../kix/';
import {
    GeneralCatalogItem, KIXObjectType, Form, FormFieldValue, FormField, GeneralCatalogItemProperty, KIXObjectProperty
} from "../../model";
import { ContextService } from "..";
import { EditGeneralCatalogDialogContext } from ".";

export class GeneralCatalogFormService extends KIXObjectFormService<GeneralCatalogItem> {

    private static INSTANCE: GeneralCatalogFormService = null;

    public static getInstance(): GeneralCatalogFormService {
        if (!GeneralCatalogFormService.INSTANCE) {
            GeneralCatalogFormService.INSTANCE = new GeneralCatalogFormService();
        }
        return GeneralCatalogFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.GENERAL_CATALOG_ITEM;
    }

}
