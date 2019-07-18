/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FollowUpType } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class FollowUpTypeBrowserFactory implements IKIXObjectFactory<FollowUpType> {

    private static INSTANCE: FollowUpTypeBrowserFactory;

    public static getInstance(): FollowUpTypeBrowserFactory {
        if (!FollowUpTypeBrowserFactory.INSTANCE) {
            FollowUpTypeBrowserFactory.INSTANCE = new FollowUpTypeBrowserFactory();
        }
        return FollowUpTypeBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(followUpType: FollowUpType): Promise<FollowUpType> {
        return new FollowUpType(followUpType);
    }

}
