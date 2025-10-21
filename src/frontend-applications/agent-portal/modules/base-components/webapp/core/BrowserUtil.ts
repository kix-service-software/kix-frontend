/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { OverlayService } from './OverlayService';
import { OverlayType } from './OverlayType';
import { ComponentContent } from './ComponentContent';
import { ToastContent } from './ToastContent';
import { ConfirmOverlayContent } from './ConfirmOverlayContent';
import { DateTimeUtil } from './DateTimeUtil';
import { ValidationResult } from './ValidationResult';
import { ValidationSeverity } from './ValidationSeverity';
import { EventService } from './EventService';
import { ApplicationEvent } from './ApplicationEvent';
import { LoadingShieldEventData } from './LoadingShieldEventData';
import { ContextService } from './ContextService';
import { PlaceholderService } from './PlaceholderService';
import { InlineContent } from './InlineContent';
import { AgentService } from '../../../user/webapp/core/AgentService';
import { IDownloadableFile } from '../../../../model/IDownloadableFile';
import { PersonalSettingsProperty } from '../../../user/model/PersonalSettingsProperty';
import { WindowListener } from './WindowListener';
import { ToastUtil } from '../../../toast/webapp/core/ToastUtil';
import { RoutingService } from './RoutingService';
import { SysConfigService } from '../../../sysconfig/webapp/core/SysConfigService';
import { DefaultColorConfiguration } from '../../../../model/configuration/DefaultColorConfiguration';
import { ModalSettings } from '../../../toast/model/ModalSettings';
import DOMPurify from 'dompurify';

export class BrowserUtil {

    private static userColors: Map<number, string> = new Map();

    public static readonly URL_REGEX = /(https?|ftps?|sftp):\/\/[^\s]+/;

    private static frameIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();

    public static openErrorOverlay(error: string): void {
        ToastUtil.showErrorToast(error);
    }

    public static async openSuccessOverlay(message: string): Promise<void> {
        ToastUtil.showSuccessToast(message);
    }

    public static async openInfoOverlay(message: string): Promise<void> {
        ToastUtil.showInfoToast(message);
    }

    public static async openConfirmOverlay(
        title: string = 'Sure?', confirmText: string = 'Are you sure?',
        confirmCallback: () => void = null, cancelCallback: () => void = null,
        labels: [string, string] = ['Yes', 'No'], closeButton?: boolean, decision?: [string, string],
        focusConfirm?: boolean, silent?: boolean
    ): Promise<void> {
        const preference = decision ? await AgentService.getInstance().getUserPreference(decision[0]) : null;
        if ((BrowserUtil.isBooleanTrue(preference?.Value)) || silent) {
            confirmCallback();
        } else {
            const modalSettings = new ModalSettings(confirmCallback, cancelCallback, title, confirmText);
            modalSettings.okLabel = labels?.length === 2 ? labels[0] : undefined;
            modalSettings.cancelLabel = labels?.length === 2 ? labels[1] : undefined;
            modalSettings.decisionPreference = decision?.length === 2 ? decision[0] : undefined;
            modalSettings.decisionTitle = decision?.length === 2 ? decision[1] : undefined;
            ToastUtil.showConfirmModal(modalSettings);
        }
    }

    public static openAppRefreshOverlay(): void {
        ToastUtil.showRefreshToast();
    }

    public static async openAccessDeniedOverlay(): Promise<void> {
        const content = new ComponentContent(
            'toast',
            new ToastContent(
                'kix-icon-close', 'Translatable#No permission for this object.', 'Translatable#Access denied'
            )
        );
        OverlayService.getInstance().openOverlay(OverlayType.ERROR_TOAST, null, content, 'Translatable#Access denied');
    }

    public static startBrowserDownload(
        fileName: string, content: string, contentType: string, base64: boolean = true
    ): void {
        content = content.replace(/\r?\n|\r/, '\n');

        const FileSaver = require('file-saver');
        const blob = base64 ? this.b64toBlob(content, contentType)
            : new Blob([content], { type: contentType });

        const file = new File([blob], fileName, { type: contentType });
        FileSaver.saveAs(file);
    }

    public static async startFileDownload(file: IDownloadableFile): Promise<void> {
        const user = await AgentService.getInstance().getCurrentUser().catch(
            () => console.error('Could not get current user to start download.')
        );
        if (user) {
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = `/files/download/${encodeURIComponent(file.downloadId)}`;
            a.download = file.Filename;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
    }

    public static openPDF(content: string, name?: string): void {
        const pdfWindow = window.open(
            '', '_blank', 'menubar=no,toolbar=no,location=no,status=no,scrollbars=yes'
        );
        if (name) {
            pdfWindow.document.title = name;
        }
        const pdfBuffer = Buffer.from(content, 'base64');
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const pdfURL = URL.createObjectURL(blob);
        pdfWindow.document.body.innerHTML
            = '<embed style="height:100%; width:100%" type="application/pdf" src="' + pdfURL + '" />';
    }

    public static readFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            if (file instanceof File) {
                const reader = new FileReader();
                reader.onload = (): void => {
                    let content = reader.result.toString();
                    content = content.split(',')[1];
                    resolve(content);
                };

                // get base64 string
                reader.readAsDataURL(file);
            }
        });
    }

    public static readFileAsText(file: File, encoding: string = 'UTF-8'): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (): void => {
                const content = reader.result.toString();
                resolve(content);
            };
            reader.readAsText(file, encoding);
        });
    }

    public static parseCSV(csvString: string, textSeparator: string = '"', valueSeparator: string = ';'): string[][] {
        const list = [];
        let quote = false;

        for (let row = 0, column = 0, character = 0; character < csvString.length; character++) {
            const currentCharacter = csvString[character];
            const nextCharacter = csvString[character + 1];
            list[row] = list[row] || [];
            list[row][column] = list[row][column] || '';

            if (
                currentCharacter.match(new RegExp(textSeparator))
                && quote && nextCharacter && nextCharacter.match(new RegExp(textSeparator))
            ) {
                list[row][column] += currentCharacter; ++character; continue;
            }

            if (currentCharacter.match(new RegExp(textSeparator))) { quote = !quote; continue; }

            if (currentCharacter.match(new RegExp(valueSeparator)) && !quote) { ++column; continue; }

            if (
                currentCharacter === '\r' && nextCharacter === '\n' && !quote
            ) { ++row; column = 0; ++character; continue; }

            if (currentCharacter === '\n' && !quote) { ++row; column = 0; continue; }
            if (currentCharacter === '\r' && !quote) { ++row; column = 0; continue; }

            list[row][column] += currentCharacter;
        }

        return list;
    }

    public static calculateAverage(values: number[]): number {
        if (values && values.length) {
            let sum = 0;
            values.forEach((v) => sum += v);
            return BrowserUtil.round(sum / values.length);
        }
        return 0;
    }

    public static getBrowserFontsize(): number {
        const browserFontSizeSetting = getComputedStyle(document.getElementsByTagName('body')[0])
            .getPropertyValue('font-size');
        return Number(browserFontSizeSetting.replace('px', ''));
    }

    public static round(value: number, step: number = 0.5): number {
        const inv = 1.0 / step;
        return Math.round(value * inv) / inv;
    }

    private static b64toBlob(b64Data: string, contentType: string = '', sliceSize: number = 512): Blob {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    public static scrollIntoViewIfNeeded(element: any): void {
        const scrollIntoView = require('scroll-into-view-if-needed');
        scrollIntoView(element, { behavior: 'smooth', scrollMode: 'if-needed' });
    }

    public static encodeHTMLString(value: string): string {
        value = value.toLocaleLowerCase()
            .replace(/ä/g, '&auml;')
            .replace(/ö/g, '&ouml;')
            .replace(/ü/g, '&uuml;');

        return value;
    }

    public static async downloadCSVFile(csvString: string, filename: string, withDate: boolean = true): Promise<void> {
        const now = DateTimeUtil.getTimestampNumbersOnly(new Date(Date.now()));
        const fileName = `${filename}${withDate ? '_' + now : ''}.csv`;

        const element = document.createElement('a');
        element.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString);
        element.download = fileName;
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    public static showValidationError(result: ValidationResult[]): void {
        const errorMessages = result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message);
        const content = new ComponentContent('list-with-title',
            {
                title: 'Translatable#Error on form validation:',
                list: errorMessages
            }
        );

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, 'Translatable#Validation error', null, true
        );
    }

    public static toggleLoadingShield(
        shieldId: string, loading: boolean, hint?: string, time?: number,
        cancelCallback?: () => void, cancelButtonText?: string
    ): void {
        EventService.getInstance().publish(
            ApplicationEvent.TOGGLE_LOADING_SHIELD,
            new LoadingShieldEventData(shieldId, loading, hint, time, cancelCallback, cancelButtonText)
        );
    }

    public static getRandomColor(): string {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    public static async getUserColor(userId: number): Promise<string> {
        if (!this.userColors.has(userId)) {
            let color = this.getRandomColor();

            if (userId === 1) {
                color = '#99a';
            } else {
                const colorConfig = await SysConfigService.getInstance().getUIConfiguration<DefaultColorConfiguration>(
                    DefaultColorConfiguration.CONFIGURATION_ID
                );
                if (Array.isArray(colorConfig?.defaultColors) && colorConfig.defaultColors.length) {
                    const configuredColor = colorConfig.defaultColors[userId % colorConfig.defaultColors.length];
                    if (configuredColor) {
                        color = configuredColor;
                    }
                }
            }

            this.userColors.set(userId, color);
        }

        return this.userColors.get(userId);
    }

    public static async prepareUrlParameter(params: Array<[string, any]>): Promise<string[]> {
        const urlParams = [];
        if (Array.isArray(params)) {
            for (const param of params) {
                const paramValue = await this.prepareUrlParameterValue(param[1]);
                urlParams.push(`${param[0]}=${paramValue}`);
            }
        }
        return urlParams;
    }

    public static async prepareUrlParameterValue(value: any): Promise<string> {
        const context = ContextService.getInstance().getActiveContext();
        const contextObject = await context.getObject();

        let paramValue = JSON.stringify(value);
        paramValue = await PlaceholderService.getInstance().replacePlaceholders(paramValue, contextObject);
        paramValue = encodeURI(paramValue);

        return paramValue;
    }

    public static replaceInlineContent(value: string, inlineContent: InlineContent[]): string {
        let newString = value;
        if (inlineContent) {
            for (const contentItem of inlineContent) {
                if (contentItem.contentId && contentItem.contentType) {
                    const contentType = contentItem.contentType.replace(new RegExp('"', 'g'), '\'');
                    const replaceString = `data:${contentType};base64,${contentItem.content}`;
                    const contentIdLength = contentItem.contentId.length - 1;
                    const contentId = contentItem.contentId.substring(1, contentIdLength);
                    const regexpString = new RegExp('cid:' + contentId, 'g');
                    newString = newString.replace(regexpString, replaceString);
                }
            }
        }
        return newString;
    }

    public static stringifyJSON(json: any): string {
        try {
            const replacerFunc = (): (key: string, value: any) => string => {
                const visited = new WeakSet();
                return (key: string, value: any): string => {
                    if (typeof value === 'object' && value !== null) {
                        if (visited.has(value)) {
                            return;
                        }
                        visited.add(value);
                    }
                    return value;
                };
            };
            json = JSON.stringify(json, replacerFunc(), 4);
        } catch (e) {
            console.error(e);
            json = '';
        }

        return json;
    }

    public static formatJSON(json: any): string {
        if (typeof json !== 'string') {
            json = this.stringifyJSON(json);
        }

        json = json
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
        json = json.replace(regex, (match) => {
            // eslint-disable-next-line no-unused-vars
            let cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                // eslint-disable-next-line no-unused-vars
                cls = 'null';
            }
            return match;
        });

        return json;
    }

    public static jsonStringifyreplacerFunc(): (key: string, value: any) => string {
        const visited = new WeakSet();
        return (key: string, value: any): string => {
            if (typeof value === 'object' && value !== null) {
                if (visited.has(value)) {
                    return;
                }
                visited.add(value);
            }
            return value;
        };
    }

    // use timeout to:
    //   1) enable multi click selection (e.g. hole word by double click)
    //   2) return false if selection is removed by single click
    private static clickTimeout;
    public static isTextSelected(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (this.clickTimeout) {
                clearTimeout(this.clickTimeout);
            }
            this.clickTimeout = setTimeout(async () => {
                this.clickTimeout = undefined;
                // ingore cTESTlick if text is selected
                if (window.getSelection()?.type === 'Range') {
                    resolve(true);
                }
                resolve(false);
            }, 175);
        });
    }

    public static isBooleanTrue(value?: string): boolean {
        let result = false;

        if (typeof value === 'string') {
            result = value && value !== '0' && value !== 'false';
        } else if (typeof value === 'number') {
            result = Boolean(value);
        } else if (typeof value === 'boolean') {
            result = value;
        }

        return result;
    }

    public static applyStyle(id: string, style: string): void {
        id = `ckeditor-style-${id}`;
        const styleElement = document.getElementById(id);
        if (styleElement) {
            styleElement.innerHTML = style;
        } else {
            const headElement = document.getElementsByTagName('head');
            const styleElement = document.createElement('style');
            styleElement.id = id;
            styleElement.innerHTML = style;
            headElement[0].appendChild(styleElement);
        }
    }

    public static removeStyle(id: string): void {
        id = `ckeditor-style-${id}`;
        const styleElement = document.getElementById(id);
        if (styleElement) {
            styleElement.remove();
        }
    }

    public static async handleBeforeUnload(
        preferenceName: string = PersonalSettingsProperty.DONT_ASK_ON_EXIT
    ): Promise<void> {
        const preventExitPopupPref = await AgentService.getInstance().getUserPreference(preferenceName);
        if (Boolean(Number(preventExitPopupPref?.Value))) {
            WindowListener.getInstance().removeBrowserListener();
        } else {
            WindowListener.getInstance().addBrowserListener();
        }
    }

    public static handleLinkClicked(event): void {
        const linkElement = event?.target?.closest('a');
        // handle links but not if user requested a new browser tab (ctrl) or window (shift)
        if (linkElement && !event.ctrlKey && !event.shiftKey) {
            event.preventDefault();
            // "open" KIX internal links as KIX tabs
            if (window.location.host === linkElement.host) {
                RoutingService.getInstance().routeToURL(true, linkElement.href);
            }
            // else open new browser tab
            else {
                window.open(linkElement.href, '_blank', 'noopener, noreferrer');
            }
        }
    }

    public static wrapLinksAndEmailsAndAppendToElement(
        id: string, text: string
    ): void {
        const parent = document.getElementById(id);
        if (!parent) {
            console.error('No parent element');
            return;
        }
        parent.innerHTML = '';
        const regex = /((https?:\/\/[^\s]+)|(mailto:[^\s]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))/g;

        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            const matchText = match[0];
            const matchIndex = match.index;

            if (lastIndex < matchIndex) {
                const plainText = text.slice(lastIndex, matchIndex);
                parent.appendChild(document.createTextNode(plainText));
            }

            let linkEl: HTMLAnchorElement;

            if (matchText.startsWith('http')) {
                linkEl = document.createElement('a');
                linkEl.href = matchText;
                linkEl.target = '_blank';
                linkEl.rel = 'noopener noreferrer';
                linkEl.textContent = matchText;
                linkEl.className = 'link-opacity-50-hover';
            } else if (matchText.includes('@')) {
                linkEl = document.createElement('a');
                linkEl.href = matchText.startsWith('mailto:') ? matchText : `mailto:${matchText}`;
                linkEl.textContent = matchText.replace(/^mailto:/, '');
                linkEl.className = 'link-opacity-50-hover';
            }

            parent.appendChild(linkEl);
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            parent.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
    }

    public static cleanupHTML(htmlDocument: Document): void {
        const scriptElements = htmlDocument.getElementsByTagName('script');
        for (let i = 0; i < scriptElements.length; i++) {
            scriptElements.item(i).remove();
        }

        this.removeListenersFromTags(htmlDocument);
    }

    private static removeListenersFromTags(htmlDocument: Document): void {
        // try to remove listener and functions
        const allElements = Array.prototype.slice.call(htmlDocument.querySelectorAll('*'));
        allElements.push(htmlDocument);
        const types = [];

        for (let ev in htmlDocument) {
            if (/^on/.test(ev)) {
                types.push(ev);
            }
        }

        for (const currentElement of allElements) {
            for (const type of types) {
                try {
                    const attribute = currentElement.getAttribute(type);
                    if (attribute) {
                        currentElement.removeAttribute(type);
                    }
                } catch (e) {
                    // do nothing
                }
            }
        }
    }

    public static appendKIXStyling(htmlDocument: Document): void {
        const kixLink = htmlDocument.createElement('link');
        kixLink.rel = 'stylesheet';
        kixLink.href = '/static/applications/application/lasso-less.css';
        htmlDocument.head.appendChild(kixLink);

        const bootstrapLink = htmlDocument.createElement('link');
        bootstrapLink.rel = 'stylesheet';
        bootstrapLink.href = '/static/thirdparty/bootstrap-5.3.2/css/bootstrap.min.css';
        htmlDocument.head.appendChild(bootstrapLink);
    }

    public static buildHtmlStructur(html: string): string {
        const cleanHTML = DOMPurify.sanitize(html);
        return `
            <html>
                <head>
                    <link rel="stylesheet" href="/static/applications/application/lasso-less.css"/>
                    <link rel="stylesheet" href="/static/thirdparty/bootstrap-5.3.2/css/bootstrap.min.css"/>
                </head>
                <body>
                    ${cleanHTML}
                </body>
            </html>
        `;
    }

    public static getCurrentContentScrollPosition(): number {
        const wrapperEl = document.getElementsByClassName('content-wrapper');
        if (wrapperEl.length) {
            return wrapperEl[0].scrollTop;
        } else {
            return document.getElementById('ssp-content').scrollTop;
        }
    }

    public static setCurrentContentScrollPosition(scrollPosition: number): void {
        const wrapperEl = document.getElementsByClassName('content-wrapper');
        const options: ScrollToOptions = { top: scrollPosition, left: 0, behavior: 'smooth' };
        if (wrapperEl.length) {
            wrapperEl[0].scrollTo(options);
        } else {
            return document.getElementById('ssp-content').scrollTo(options);
        }
    }

    public static setFrameHeight(frameId: string): void {
        const frame = document.getElementById(frameId) as HTMLIFrameElement;

        const frameInterval = this.frameIntervals.get(frameId);

        if (frame) {
            // set frame height to 0px to get minimal scollHeight
            frame.style.height = '0px';

            const frameHeight = frame?.contentWindow?.document?.body?.scrollHeight || 0;
            if (frameHeight > 0) {
                frame.style.height = frameHeight + 20 + 'px';

                clearInterval(frameInterval);
                this.frameIntervals.delete(frameId);
            } else if (!frameInterval) {
                this.frameIntervals.set(frameId, setInterval(() => this.setFrameHeight(frameId), 500));
            }
        }
        else if (!frameInterval) {
            this.frameIntervals.set(frameId, setInterval(() => this.setFrameHeight(frameId), 500));
        }
    }

}
