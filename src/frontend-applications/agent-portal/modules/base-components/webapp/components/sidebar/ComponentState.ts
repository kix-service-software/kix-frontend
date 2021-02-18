/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfiguredWidget } from '../../../../../model/configuration/ConfiguredWidget';
import { ContextType } from '../../../../../model/ContextType';


export class ComponentState {

    public sidebars: Array<[string, any]> = [];
    public showIconBar: boolean = true;
    public rows: string[] = [];
    public context: string = 'dashboard';
    public sidebarBarExpanded: boolean = false;
    public showSidebar: boolean = false;
    public contextType: ContextType = null;
    public loading: boolean = false;

}
