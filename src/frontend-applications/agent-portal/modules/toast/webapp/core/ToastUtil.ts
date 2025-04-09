/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXModulesService } from '../../../base-components/webapp/core/KIXModulesService';

declare const bootstrap: any;

export class ToastUtil {

    private static showRefreshToastTimeout: any;

    public static async showInfoToast(message: string): Promise<void> {
        this.showToast('info-toast', { message }, { autohide: true, animation: true, delay: 2500 });
    }

    public static async showErrorToast(message: string): Promise<void> {
        this.showToast('error-toast', { message }, { autohide: false, animation: true, delay: 2500 });
    }

    public static async showSuccessToast(message: string): Promise<void> {
        this.showToast('success-toast', { message }, { autohide: true, animation: true, delay: 2500 });
    }

    public static showRefreshToast(): void {
        if (this.showRefreshToastTimeout) {
            clearTimeout(this.showRefreshToastTimeout);
        }

        this.showRefreshToastTimeout = setTimeout(() => {
            this.showToast('refresh-app-toast', {}, { autohide: false, animation: true });
        }, 200);
    }

    private static showToast(toastId: string, toastData: any = {}, toastOptions: any = {}): void {
        const toastArea = document.getElementById('kix-toast-area');
        if (toastArea) {
            const template = KIXModulesService.getComponentTemplate(toastId);
            const content = template?.default?.renderSync(toastData);
            content.appendTo(toastArea);

            const templateToast = new bootstrap.Toast(`#${toastId}`, toastOptions);
            templateToast?.show();

            const toastElement = document.getElementById(toastId);
            toastElement.addEventListener('hidden.bs.toast', (event) => {
                toastElement?.remove();
            });
        }
    }

}