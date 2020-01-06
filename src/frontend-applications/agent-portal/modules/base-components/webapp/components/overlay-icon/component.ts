/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { StringContent } from '../../../../../modules/base-components/webapp/core/StringContent';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { IdService } from '../../../../../model/IdService';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';

class Component {

    private state: ComponentState;
    private listenerId: string = null;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.isHintOverlay = input.isHint || false;
        this.state.large = typeof input.large !== 'undefined' ? input.large : false;
        if (this.state.isHintOverlay) {
            this.state.content = new StringContent(input.content);
        } else {
            this.state.content = new ComponentContent(input.content, input.data);
        }

        this.state.instanceId = input.instanceId;
        this.state.title = input.title;
    }

    public onMount(): void {
        this.listenerId = IdService.generateDateBasedId('icon-');
        OverlayService.getInstance().registerOverlayListener(this.listenerId, this);
    }

    public onDestroy(): void {
        OverlayService.getInstance().unregisterOverlayListener(this.listenerId);
    }

    public showOverlay(event: any) {
        if (!this.state.show) {
            OverlayService.getInstance().openOverlay(
                this.state.isHintOverlay ? OverlayType.HINT : OverlayType.INFO,
                this.state.instanceId,
                this.state.content,
                this.state.title,
                false,
                [
                    event.target.getBoundingClientRect().left + BrowserUtil.getBrowserFontsize(),
                    event.target.getBoundingClientRect().top
                ],
                this.listenerId,
                this.state.large
            );
        }
    }

    public getOverlayClasses(): string {
        let classes = 'kix-icon-icircle';
        if (this.state.isHintOverlay) {
            classes = 'kix-icon-question hint-icon';
        }
        return classes;
    }

    public overlayOpened(): void {
        this.state.show = true;
    }

    public overlayClosed(): void {
        this.state.show = false;
    }

}

module.exports = Component;
