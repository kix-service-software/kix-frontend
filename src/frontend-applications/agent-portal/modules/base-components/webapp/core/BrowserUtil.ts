/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { OverlayService } from './OverlayService';
import { OverlayType } from './OverlayType';
import { StringContent } from './StringContent';
import { ComponentContent } from './ComponentContent';
import { ToastContent } from './ToastContent';
import { ConfirmOverlayContent } from './ConfirmOverlayContent';
import { RefreshToastSettings } from './RefreshToastSettings';
import { DateTimeUtil } from './DateTimeUtil';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ValidationResult } from './ValidationResult';
import { ValidationSeverity } from './ValidationSeverity';
import { EventService } from './EventService';
import { ApplicationEvent } from './ApplicationEvent';
import { LoadingShieldEventData } from './LoadingShieldEventData';
import { ContextService } from './ContextService';
import { PlaceholderService } from './PlaceholderService';
import { InlineContent } from './InlineContent';
import { AgentService } from '../../../user/webapp/core/AgentService';


export class BrowserUtil {

    private static userColors: Map<number, string> = new Map();

    public static openErrorOverlay(error: string): void {
        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, new StringContent(error), 'Translatable#Error!', null, true
        );
    }

    public static async openSuccessOverlay(message: string): Promise<void> {
        setTimeout(() => {
            const content = new ComponentContent('toast', new ToastContent('kix-icon-check', message));
            OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, 'Translatable#Success!');
        }, 500);
    }

    public static async openInfoOverlay(message: string): Promise<void> {
        setTimeout(() => {
            const content = new ComponentContent('toast', new ToastContent('kix-icon-info', message));
            OverlayService.getInstance().openOverlay(OverlayType.INFO_TOAST, null, content, 'Translatable#Hint');
        }, 500);
    }

    public static async openConfirmOverlay(
        title: string = 'Sure?', confirmText: string = 'Are you sure?',
        confirmCallback: () => void = null, cancelCallback: () => void = null,
        labels: [string, string] = ['Yes', 'No'], closeButton?: boolean, decision?: [string, string],
        focusConfirm?: boolean, silent?: boolean
    ): Promise<void> {
        const preference = decision ? await AgentService.getInstance().getUserPreference(decision[0]) : null;
        if ((preference && Boolean(Number(preference.Value))) || silent) {
            confirmCallback();
        } else {
            const content = new ComponentContent(
                'confirm-overlay',
                new ConfirmOverlayContent(confirmText, confirmCallback, cancelCallback, labels, decision, focusConfirm)
            );
            OverlayService.getInstance().openOverlay(
                OverlayType.CONFIRM, null, content, title, null, closeButton,
                undefined, undefined, undefined, undefined, undefined
            );
        }
    }

    public static openAppRefreshOverlay(
        message: string, objectType: KIXObjectType | string, reloadApp?: boolean
    ): void {
        const settings = new RefreshToastSettings(message, reloadApp, objectType);
        const componentContent = new ComponentContent('refresh-app-toast', settings);
        OverlayService.getInstance().openOverlay(
            OverlayType.HINT_TOAST, null, componentContent, '', null, false, null, null, null, null, true
        );
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
        if (window.navigator.msSaveOrOpenBlob) {
            FileSaver.saveAs(blob, fileName);
        } else {
            const file = new File([blob], fileName, { type: contentType });
            FileSaver.saveAs(file);
        }
    }

    public static openPDF(content: string, name?: string): void {
        const pdfWindow = window.open(
            '', '_blank', 'menubar=no,toolbar=no,location=no,status=no,scrollbars=yes'
        );
        if (name) {
            pdfWindow.document.title = name;
        }
        pdfWindow.document.body.innerHTML
            = '<embed style="height:100%; width:100%" type="application/pdf" src="data:application/pdf;'
            + ';base64,' + content + '" />';
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

    private static round(value: number, step: number = 0.5): number {
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
        if (window.navigator.msSaveOrOpenBlob) {
            const blob = new Blob([csvString], { type: 'text/csv' });
            window.navigator.msSaveBlob(blob, fileName);
        } else {
            const element = document.createElement('a');
            element.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString);
            element.download = fileName;
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
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

    public static getUserColor(userId: number): string {
        if (!this.userColors.has(userId)) {
            let color = this.getRandomColor();
            if (userId === 1) {
                color = '#e31e24';
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

}
