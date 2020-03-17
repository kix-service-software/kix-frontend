/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from "../../../../modules/base-components/webapp/core/IKIXObjectFactory";
import { TextModule } from "../../model/TextModule";

export class TextModuleBrowserFactory implements IKIXObjectFactory<TextModule> {

    private static INSTANCE: TextModuleBrowserFactory;

    public static getInstance(): TextModuleBrowserFactory {
        if (!TextModuleBrowserFactory.INSTANCE) {
            TextModuleBrowserFactory.INSTANCE = new TextModuleBrowserFactory();
        }
        return TextModuleBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(textModule: TextModule): Promise<TextModule> {
        const newTextModule = new TextModule(textModule);
        return newTextModule;
    }

}
