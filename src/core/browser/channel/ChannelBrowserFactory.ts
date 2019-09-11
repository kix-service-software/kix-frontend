/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Channel } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class ChannelBrowserFactory implements IKIXObjectFactory<Channel> {

    private static INSTANCE: ChannelBrowserFactory;

    public static getInstance(): ChannelBrowserFactory {
        if (!ChannelBrowserFactory.INSTANCE) {
            ChannelBrowserFactory.INSTANCE = new ChannelBrowserFactory();
        }
        return ChannelBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(state: Channel): Promise<Channel> {
        return new Channel(state);
    }

}
