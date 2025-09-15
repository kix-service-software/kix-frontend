/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { DateTimeUtil } from '../../../../base-components/webapp/core/DateTimeUtil';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.notification = input.notification;
    }

    public async onMount(): Promise<void> {
        this.state.createTime = await DateTimeUtil.getLocalDateTimeString(this.state.notification?.createTime);

        setTimeout(() => {
            const iframe: any = document.getElementById(this.state.frameId);
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            iframeDocument.body.innerHTML = this.state.notification.fullText;
            BrowserUtil.cleanupHTML(iframeDocument);
            BrowserUtil.appendKIXStyling(iframeDocument);
        }, 100);

    }

    public viewLoaded(event: any): void {
        const frameDocument = event.target.contentWindow.document;

        const bodyElements = frameDocument.documentElement.getElementsByTagName('body');
        if (bodyElements?.length) {
            bodyElements[0].addEventListener('click', (event) => {
                BrowserUtil.handleLinkClicked(event);
            });
        }

    }

}

module.exports = Component;