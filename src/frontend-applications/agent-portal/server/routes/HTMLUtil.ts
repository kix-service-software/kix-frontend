import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { LoggingService } from '../../../../server/services/LoggingService';

export class HTMLUtil {

    public static sanitizeContent(content: string, prepareLinkTargets?: boolean): string {
        try {
            const { JSDOM } = require('jsdom');
            const jsDOMWindow = new JSDOM('').window;

            const createDOMPurify = require('dompurify');
            const DOMPurify = createDOMPurify(jsDOMWindow);
            const cleanHTML = DOMPurify.sanitize(
                content,
                {
                    USE_PROFILES: { html: true },
                    ADD_TAGS: ['style']
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

            return htmlDOM.window.document.documentElement.innerHTML;
        } catch (e) {
            LoggingService.getInstance().error(e);
        }
    }

    public static buildHtmlStructur(content: string, additionalHeader: string[] = []): string {
        const config = ConfigurationService.getInstance().getServerConfiguration();
        const baseRoute = config?.BASE_ROUTE || '';
        return `
                    <html>
                        <head>
                            <link rel="stylesheet" href="${baseRoute}/static/applications/application/lasso-less.css"/>
                            <link rel="stylesheet" href="${baseRoute}/static/thirdparty/bootstrap-5.3.2/css/bootstrap.min.css"/>
                            ${additionalHeader.join('\n')}
                        </head>
                        <body>
                            ${content}
                        </body>
                    </html>
                `;
    }

}