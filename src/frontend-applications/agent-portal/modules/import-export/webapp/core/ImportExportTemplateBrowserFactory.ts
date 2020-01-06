/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFactory } from "../../../base-components/webapp/core/KIXObjectFactory";
import { ImportExportTemplate } from "../../model/ImportExportTemplate";

export class ImportExportTemplateBrowserFactory extends KIXObjectFactory<ImportExportTemplate> {

    private static INSTANCE: ImportExportTemplateBrowserFactory;

    public static getInstance(): ImportExportTemplateBrowserFactory {
        if (!ImportExportTemplateBrowserFactory.INSTANCE) {
            ImportExportTemplateBrowserFactory.INSTANCE = new ImportExportTemplateBrowserFactory();
        }
        return ImportExportTemplateBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(template: ImportExportTemplate): Promise<ImportExportTemplate> {
        const newTemplate = new ImportExportTemplate(template);
        return newTemplate;
    }

}
