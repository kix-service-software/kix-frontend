/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from './SocketNameSpace';
import { Socket } from 'socket.io';
import { SocketResponse } from '../core/common';
import {
    ISocketRequest, WebformEvent, LoadWebformsResponse, CreateObjectResponse, Error, DateTimeUtil
} from '../core/model';
import { ConfigurationService, LoggingService } from '../core/services';
import { SaveWebformRequest } from '../core/model/socket/application/SaveWebformRequest';
import { UserService } from '../core/services/impl/api/UserService';

export class WebformNameSpace extends SocketNameSpace {

    private static INSTANCE: WebformNameSpace;

    public static getInstance(): WebformNameSpace {
        if (!WebformNameSpace.INSTANCE) {
            WebformNameSpace.INSTANCE = new WebformNameSpace();
        }
        return WebformNameSpace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'webform';
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(client, WebformEvent.LOAD_WEBFORMS, this.loadWebforms.bind(this));
        this.registerEventHandler(client, WebformEvent.SAVE_WEBFORM, this.saveWebform.bind(this));
    }

    private async loadWebforms(data: ISocketRequest): Promise<SocketResponse> {
        const webformsConfiguration = ConfigurationService.getInstance().getConfiguration('webforms');
        const webforms = webformsConfiguration ? webformsConfiguration : [];

        return new SocketResponse(
            WebformEvent.LOAD_WEBFORMS_FINISHED,
            new LoadWebformsResponse(data.requestId, webforms)
        );
    }

    private async saveWebform(data: SaveWebformRequest): Promise<SocketResponse> {
        const user = await UserService.getInstance().getUserByToken(data.token);
        const userId = user.UserID;

        data.webform.CreateBy = userId;
        data.webform.ChangeBy = userId;

        const date = DateTimeUtil.getKIXDateTimeString(new Date());
        data.webform.CreateTime = date;
        data.webform.ChangeTime = date;

        data.webform.ObjectId = Date.now();

        const webformsConfiguration = ConfigurationService.getInstance().getConfiguration('webforms');
        const webforms = webformsConfiguration ? webformsConfiguration : [];

        webforms.push(data.webform);

        await ConfigurationService.getInstance().saveConfiguration('webforms', webforms)
            .catch((error: Error) => LoggingService.getInstance().error(error.Message, error));

        return new SocketResponse(
            WebformEvent.WEBFORM_SAVED,
            new CreateObjectResponse(data.requestId, data.webform.ObjectId)
        );
    }
}
