/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { ImportExportTemplate } from '../model/ImportExportTemplate';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { Error } from '../../../../../server/model/Error';
import { CreateImportExportTemplateRunOptions } from '../model/CreateImportExportTemplateRunOptions';
import { ImportExportTemplateRunProperty } from '../model/ImportExportTemplateRunProperty';
import { ImportExportTemplateRunTypes } from '../model/ImportExportTemplateRunTypes';
import { ImportExportTemplateRunPostResult } from '../model/ImportExportTemplateRunPostResult';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class ImportExportAPIService extends KIXObjectAPIService {

    private static INSTANCE: ImportExportAPIService;

    public static getInstance(): ImportExportAPIService {
        if (!ImportExportAPIService.INSTANCE) {
            ImportExportAPIService.INSTANCE = new ImportExportAPIService();
        }
        return ImportExportAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'system/importexport/templates';

    public objectType: KIXObjectType = KIXObjectType.IMPORT_EXPORT_TEMPLATE;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === this.objectType
            || kixObjectType === KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse();
        if (objectType === KIXObjectType.IMPORT_EXPORT_TEMPLATE) {
            objectResponse = await super.load<ImportExportTemplate>(
                token, KIXObjectType.IMPORT_EXPORT_TEMPLATE, this.RESOURCE_URI, loadingOptions, objectIds,
                'ImportExportTemplate', clientRequestId, ImportExportTemplate
            );
        }

        return objectResponse as ObjectResponse<T>;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number | string> {
        let result;

        if (objectType === KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN) {
            const templateId = createOptions ?
                (createOptions as CreateImportExportTemplateRunOptions).templateId : null;
            if (templateId) {
                const uri = this.buildUri(this.RESOURCE_URI, templateId, 'runs');

                const execType = this.getParameterValue(parameter, ImportExportTemplateRunProperty.TYPE);

                result = await super.executeUpdateOrCreateRequest(
                    token, clientRequestId, parameter, uri, KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN,
                    execType === ImportExportTemplateRunTypes.EXPORT ?
                        ImportExportTemplateRunPostResult.EXPORT_CONTENT : ImportExportTemplateRunPostResult.TASK_ID,
                    true
                ).catch((error: Error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                    throw new Error(error.Code, error.Message);
                });
            } else {
                throw new Error('', 'templateId is missing');
            }
        }

        return result;
    }

}
