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
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { FileService } from '../../file/server/FileService';
import { UserService } from '../../user/server/UserService';
import { VirtualFSAttachmentLoadingOptions } from '../model/VirtualFSAttachmentLoadingOptions';

export class VirtualFSAPIService extends KIXObjectAPIService {

    private static INSTANCE: VirtualFSAPIService;

    public static getInstance(): VirtualFSAPIService {
        if (!VirtualFSAPIService.INSTANCE) {
            VirtualFSAPIService.INSTANCE = new VirtualFSAPIService();
        }
        return VirtualFSAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'virtualfs';

    public objectType: KIXObjectType = KIXObjectType.VIRTUAL_FS;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.VIRTUAL_FS;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: VirtualFSAttachmentLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse([], 0);
        if (objectType === KIXObjectType.VIRTUAL_FS) {

            const includes = [];
            const expands = [];

            if (!loadingOptions) {
                loadingOptions = new KIXObjectLoadingOptions(null, null, null, includes, expands);
            } else {
                if (loadingOptions.includes) {
                    loadingOptions.includes = [...loadingOptions.includes, ...includes];
                }
                else {
                    loadingOptions.includes = includes;
                }

                if (loadingOptions.expands) {
                    loadingOptions.expands = [...loadingOptions.expands, ...expands];
                } else {
                    loadingOptions.expands = expands;
                }
            }

            if (!loadingOptions.query) {
                loadingOptions.query = [];
            }

            objectResponse = await super.load(
                token, KIXObjectType.VIRTUAL_FS, this.RESOURCE_URI, loadingOptions, objectIds,
                KIXObjectType.VIRTUAL_FS, clientRequestId
            );

            if (objectLoadingOptions.asDownload) {
                let attachments = objectResponse.objects || [];
                const user = await UserService.getInstance().getUserByToken(token);
                for (const a of attachments) {
                    FileService.prepareFileForDownload(user?.UserID, a);
                }
            }
        }

        return objectResponse;
    }

}
