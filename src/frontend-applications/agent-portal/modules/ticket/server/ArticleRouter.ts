/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AuthenticationService } from '../../../../../server/services/AuthenticationService';
import { KIXRouter } from '../../../server/routes/KIXRouter';
import { Request, Response } from 'express';
import { ArticleViewUtil } from './ArticleViewUtil';
import { CheckUtil } from '../../../model/CheckUtil';
import path from 'path';

export class ArticleRouter extends KIXRouter {

    private static INSTANCE: ArticleRouter;

    public static getInstance(): ArticleRouter {
        if (!ArticleRouter.INSTANCE) {
            ArticleRouter.INSTANCE = new ArticleRouter();
        }
        return ArticleRouter.INSTANCE;
    }

    private constructor() {
        super();
    }

    public getBaseRoute(): string {
        return '/views';
    }

    protected async initialize(): Promise<void> {
        this.router.get(
            '/tickets/:ticketId/articles/:articleId',
            this.getArticlePage.bind(this)
        );
    }

    private async getArticlePage(req: Request, res: Response): Promise<void> {
        const templatePath = path.join('..', 'webapp', 'components', 'article-view');
        const template = require(templatePath).default;

        const token: string = req.cookies.token;
        const ticketId = Number(req.params.ticketId);
        const articleId = Number(req.params.articleId);
        const linesCount = CheckUtil.isNumeric(req.query.lineCount) ? Number(req.query.lineCount) : null;

        const content = await ArticleViewUtil.getArticleHTMLContent(
            token, articleId, ticketId, req.query.reduceContent === 'true',
            Number(req.query.resolveInlineCSS) === 1, linesCount, req.query.prepareInline === 'true'
        );

        (res as any).marko(template, { content: content });
    }

}
