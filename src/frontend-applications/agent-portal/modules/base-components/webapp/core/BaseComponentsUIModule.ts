/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../../../model/IUIModule";
import { ActionFactory } from "../../../../modules/base-components/webapp/core/ActionFactory";
import { SwitchColumnOrderAction } from "./table/actions";
import { PrintAction } from "../../../../modules/base-components/webapp/core/PrintAction";
import { TableCSSHandlerRegistry } from "./table";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { InvalidObjectCSSHandler } from "./table/InvalidObjectCSSHandler";

export class UIModule implements IUIModule {

    public name: string = 'BaseComponentsUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public priority: number = 800;

    public async register(): Promise<void> {
        ActionFactory.getInstance().registerAction('switch-column-order-action', SwitchColumnOrderAction);
        ActionFactory.getInstance().registerAction('print-action', PrintAction);

        TableCSSHandlerRegistry.getInstance().registerCommonCSSHandler(new InvalidObjectCSSHandler());
    }

}
