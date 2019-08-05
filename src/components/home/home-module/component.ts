/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { HomeComponentState } from './HomeComponentState';
import { ContextService } from '../../../core/browser/context/';
import { HomeContext } from '../../../core/browser/home';

class HomeComponent {

    public state: HomeComponentState;

    public onCreate(input: any): void {
        this.state = new HomeComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (await ContextService.getInstance().getContext(HomeContext.CONTEXT_ID) as HomeContext);
        this.state.contentWidgets = context.getContent();
    }

}

module.exports = HomeComponent;
