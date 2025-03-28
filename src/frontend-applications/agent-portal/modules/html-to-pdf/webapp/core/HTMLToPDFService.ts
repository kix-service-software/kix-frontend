/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { HTMLToPDF } from '../../model/HTMLToPDF';

export class HTMLToPDFService extends KIXObjectService<HTMLToPDF> {

    private static INSTANCE: HTMLToPDFService = null;

    public static getInstance(): HTMLToPDFService {
        if (!HTMLToPDFService.INSTANCE) {
            HTMLToPDFService.INSTANCE = new HTMLToPDFService();
        }

        return HTMLToPDFService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.HTML_TO_PDF);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.HTML_TO_PDF;
    }

    public getLinkObjectName(): string {
        return 'HTMLToPDF';
    }

}
