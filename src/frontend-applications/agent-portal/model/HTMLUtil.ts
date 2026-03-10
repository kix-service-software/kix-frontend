/**
 * Copyright (C) 2006-2026 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from '../../../server/services/ConfigurationService';
import { LoggingService } from '../../../server/services/LoggingService';

export class HTMLUtil {

    public static sanitizeContent(content: string, prepareLinkTargets?: boolean): any {
        try {
            const { JSDOM } = require('jsdom');
            const jsDOMWindow = new JSDOM('').window;

            const createDOMPurify = require('dompurify');
            const DOMPurify = createDOMPurify(jsDOMWindow);
            const cleanHTML = DOMPurify.sanitize(
                content,
                {
                    // Controls categories of allowed elements
                    USE_PROFILES: { html: true },
                    // Glue elements like style, script or others to `document.body`
                    // and prevent unintuitive browser behavior in several edge-cases
                    FORCE_BODY: true,
                    // Change how e.g. comments containing risky HTML characters are treated
                    SAFE_FOR_XML: false,
                    // Return a TrustedHTML object instead of a string if possible
                    RETURN_TRUSTED_TYPE: true
                }
            );
            const htmlDOM = new JSDOM(cleanHTML).window;

            const aElements = htmlDOM.window.document.querySelectorAll('a');
            if (aElements) {
                aElements.forEach((a) => {
                    if (!a.target) {
                        a.target = '_blank';
                    } if (a.target !== '_blank') {
                        a.target = '_top';
                    }
                });
            }

            const returnData = {};
            // separating the style
            const styleElements = htmlDOM.window.document.querySelectorAll('style');
            if (styleElements) {
                const headers = [];
                styleElements.forEach((style) => {
                    headers.push(style.outerHTML);
                    // after separating the style, it is removed from the DOM element.
                    style.remove();
                });
                returnData['headers'] = headers;
            }

            returnData['content'] = htmlDOM.window.document.documentElement.innerHTML;

            return returnData;
        } catch (e) {
            LoggingService.getInstance().error(e);
        }
    }

    public static buildHtmlStructur(content: string, additionalHeader: string[] = []): string {
        const baseRoute = ConfigurationService.getEnvString('BASE_ROUTE') || '';
        return `
                    <html style="height: 100%;">
                        <head>
                            ${additionalHeader.join('\n')}
                        </head>
                        <body style="height: 100%; overflow: auto">
                            ${content}
                        </body>
                    </html>
                `;
    }

}