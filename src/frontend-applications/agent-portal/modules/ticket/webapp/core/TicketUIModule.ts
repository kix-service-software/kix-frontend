/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { PlaceholderService } from '../../../../modules/base-components/webapp/core/PlaceholderService';
import {
    TicketService, TicketTypeService, TicketStateService,
    TicketPriorityService, QueueService, TicketFormService, ArticleFormService,
    TicketSearchDefinition, TicketHistoryLabelProvider, TicketTypeLabelProvider,
    TicketPriorityLabelProvider, TicketStateLabelProvider, TicketStateTypeLabelProvider, QueueLabelProvider,
} from '.';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ChannelLabelProvider } from './ChannelLabelProvider';
import { ArticleLabelProvider } from './ArticleLabelProvider';
import { TicketLabelProvider } from './TicketLabelProvider';
import { ChannelService } from './ChannelService';
import { TicketPlaceholderHandler } from './TicketPlaceholderHandler';
import { JobTypes } from '../../../job/model/JobTypes';
import { TicketArticleCreateOptionFieldHandler } from './form/extended-form-manager/TicketArticleCreateOptionFieldHandler';
import { TicketCreateDynamicFieldsOptionFieldHandler } from './form/extended-form-manager/TicketCreateDynamicFieldsOptionFieldHandler';
import { AttachmentPatternRuleFieldsOptionFieldHandler } from './form/extended-form-manager/AttachmentPatternRuleFieldsOptionFieldHandler';
import { TicketJobFormManager } from './TicketJobFormManager';
import { TicketStateSetOptionFieldHandler } from './form/extended-form-manager/TicketStateSetOptionFieldHandler';
import { TeamSetOptionFieldHandler } from './form/extended-form-manager/TeamSetOptionFieldHandler';
import { ArticlePlaceholderHandler } from './ArticlePlaceholderHandler';
import { TicketLockLabelProvider } from './TicketLockLabelProvider';
import { JobFormService } from '../../../job/webapp/core/JobFormService';
import { MacroService } from '../../../macro/webapp/core/MacroService';
import { FetchAssetAttributesOptionFieldHandler } from './form/extended-form-manager/FetchAssetAttributesOptionFieldHandler';
import { SearchService } from '../../../search/webapp/core/SearchService';
import { ObjectFormRegistry } from '../../../object-forms/webapp/core/ObjectFormRegistry';
import { TicketProperty } from '../../model/TicketProperty';
import { CreateContactFormValueAction } from './form/form-values/actions/CreateContactFormValueAction';
import { ArticleProperty } from '../../model/ArticleProperty';
import { BccFormValueAction } from './form/form-values/actions/BccFormValueAction';
import { ReplyAllFormValueAction } from './form/form-values/actions/ReplyAllFormValueAction';
import { CcFormValueAction } from './form/form-values/actions/CcFormValueAction';
import { TicketObjectFormValueMapper } from './form/TicketObjectFormValueMapper';
import { TicketStateRepository } from './TicketStateRepository';

export class UIModule implements IUIModule {

    public name: string = 'TicketReadUIModule';

    public priority: number = 100;

    protected doRegisterContexts: boolean = true;

    public async register(): Promise<void> {
        PlaceholderService.getInstance().registerPlaceholderHandler(TicketPlaceholderHandler.getInstance());
        PlaceholderService.getInstance().registerPlaceholderHandler(ArticlePlaceholderHandler.getInstance());

        ServiceRegistry.registerServiceInstance(TicketService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketTypeService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketStateService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketPriorityService.getInstance());
        ServiceRegistry.registerServiceInstance(QueueService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketFormService.getInstance());
        ServiceRegistry.registerServiceInstance(ArticleFormService.getInstance());
        ServiceRegistry.registerServiceInstance(ChannelService.getInstance());

        SearchService.getInstance().registerSearchDefinition(new TicketSearchDefinition());

        LabelService.getInstance().registerLabelProvider(new TicketLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ArticleLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketHistoryLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketTypeLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketPriorityLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketStateLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketStateTypeLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ChannelLabelProvider());
        LabelService.getInstance().registerLabelProvider(new QueueLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketLockLabelProvider());

        JobFormService.getInstance().registerJobFormManager(JobTypes.TICKET, new TicketJobFormManager());

        ObjectFormRegistry.getInstance().registerObjectFormCreator(KIXObjectType.TICKET, TicketObjectFormValueMapper);
        ObjectFormRegistry.getInstance().registerFormValueAction(ArticleProperty.TO, CcFormValueAction);
        ObjectFormRegistry.getInstance().registerFormValueAction(ArticleProperty.TO, BccFormValueAction);
        ObjectFormRegistry.getInstance().registerFormValueAction(ArticleProperty.TO, ReplyAllFormValueAction);
        ObjectFormRegistry.getInstance().registerFormValueAction(ArticleProperty.CC, BccFormValueAction);
        ObjectFormRegistry.getInstance().registerFormValueAction(
            TicketProperty.CONTACT_ID, CreateContactFormValueAction
        );

        TicketStateRepository.getInstance().init();
    }

    public async registerExtensions(): Promise<void> {
        MacroService.getInstance().registerOptionFieldHandler(new TicketArticleCreateOptionFieldHandler());
        MacroService.getInstance().registerOptionFieldHandler(new TicketCreateDynamicFieldsOptionFieldHandler());
        MacroService.getInstance().registerOptionFieldHandler(new AttachmentPatternRuleFieldsOptionFieldHandler());
        MacroService.getInstance().registerOptionFieldHandler(new TicketStateSetOptionFieldHandler());
        MacroService.getInstance().registerOptionFieldHandler(new TeamSetOptionFieldHandler());
        MacroService.getInstance().registerOptionFieldHandler(new FetchAssetAttributesOptionFieldHandler());
    }

}
