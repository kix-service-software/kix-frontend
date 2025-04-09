/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { HTMLToPDF } from '../model/HTMLToPDF';

export class HTMLToPDFService extends KIXObjectAPIService {

    private static INSTANCE: HTMLToPDFService;

    public static getInstance(): HTMLToPDFService {
        if (!HTMLToPDFService.INSTANCE) {
            HTMLToPDFService.INSTANCE = new HTMLToPDFService();
        }
        return HTMLToPDFService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'htmltopdf', 'convert');

    public objectType: KIXObjectType | string = KIXObjectType.HTML_TO_PDF;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.HTML_TO_PDF;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse([], 0);
        if (objectType === KIXObjectType.HTML_TO_PDF) {
            objectResponse = await super.load<HTMLToPDF>(
                token, KIXObjectType.HTML_TO_PDF, this.RESOURCE_URI, loadingOptions,
                objectIds, KIXObjectType.HTML_TO_PDF, clientRequestId, HTMLToPDF
            );
        }

        return objectResponse;
    }
}
