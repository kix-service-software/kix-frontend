/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Socket } from 'socket.io';
import { SocketNameSpace } from "../../../server/socket-namespaces/SocketNameSpace";
import { WebformEvent } from "../model/WebformEvent";
import { ISocketRequest } from "../../../modules/base-components/webapp/core/ISocketRequest";
import { SocketResponse } from "../../../modules/base-components/webapp/core/SocketResponse";
import { WebformService } from "./WebformService";
import { LoadWebformsResponse } from "../model/LoadWebformsResponse";
import { SaveWebformRequest } from "../model/SaveWebformRequest";
import { UserService } from "../../user/server/UserService";
import { CreateObjectResponse } from "../../../modules/base-components/webapp/core/CreateObjectResponse";


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
        const webforms = await WebformService.getInstance().loadWebforms(data.token);

        return new SocketResponse(
            WebformEvent.LOAD_WEBFORMS_FINISHED,
            new LoadWebformsResponse(data.requestId, webforms)
        );
    }

    private async saveWebform(data: SaveWebformRequest): Promise<SocketResponse> {
        const user = await UserService.getInstance().getUserByToken(data.token);
        const userId = user.UserID;

        const objectId = await WebformService.getInstance().saveWebform(
            data.token, userId, data.webform, data.webformId
        );

        return new SocketResponse(WebformEvent.WEBFORM_SAVED, new CreateObjectResponse(data.requestId, objectId));
    }
}
