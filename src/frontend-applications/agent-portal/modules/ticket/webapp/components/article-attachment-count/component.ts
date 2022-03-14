/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { Article } from '../../../model/Article';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            const articles = await context.getObjectList<Article>(KIXObjectType.ARTICLE);
            if (Array.isArray(articles)) {
                let count = 0;
                articles.forEach((article) => {
                    if (article.Attachments) {
                        const attachments = article.Attachments.filter((a) => a.Disposition !== 'inline' || a.ContentID.length === 0 && !a.Filename.match(/^file-(1|2)$/));
                        if (attachments.length > 0) {
                            count += attachments.length;
                        }
                    }
                });

                this.state.attachmentCount = count;

            }
        }
    }

    public async attachmentsClicked(): Promise<void> {
        return;
    }


}

module.exports = Component;
