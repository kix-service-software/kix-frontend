import { OverlayService } from "./OverlayService";
import { OverlayType, StringContent, ComponentContent, ToastContent, ConfirmOverlayContent } from "../model";

export class BrowserUtil {

    public static openErrorOverlay(error: string): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }

    public static openSuccessOverlay(message: string): void {
        const content = new ComponentContent('toast', new ToastContent('kix-icon-check', message));
        OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
    }

    public static openConfirmOverlay(
        title: string = 'Sicher?', confirmText: string = 'Sind Sie sicher?',
        confirmCallback: () => void = null, cancelCallback: () => void = null,
        labels: [string, string] = ['Ja', 'Nein']
    ): void {
        const content = new ComponentContent(
            'confirm-overlay', new ConfirmOverlayContent(confirmText, confirmCallback, cancelCallback, labels)
        );
        OverlayService.getInstance().openOverlay(OverlayType.CONFIRM, null, content, title, false);
    }

    public static startBrowserDownload(fileName: string, content: string, contentType: string): void {
        content = content.replace(/\r?\n|\r/, '\n');

        if (window.navigator.msSaveOrOpenBlob) {
            const blob = this.b64toBlob(content, contentType);
            window.navigator.msSaveBlob(blob, fileName);
        } else {
            const a = window.document.createElement('a');
            a.href = 'data:' + contentType + ';base64,' + content;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        }
    }

    public static readFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                let content = reader.result.toString();
                content = content.split(',')[1];
                resolve(content);
            };
            reader.readAsDataURL(file);
        });

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
        const browserFontSizeSetting = getComputedStyle(document.getElementsByTagName("body")[0])
            .getPropertyValue("font-size");
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


}
