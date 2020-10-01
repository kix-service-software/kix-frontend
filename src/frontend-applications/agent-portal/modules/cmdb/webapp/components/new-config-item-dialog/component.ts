/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TreeNode, TreeService } from '../../../../base-components/webapp/core/tree';
import { CMDBService, NewConfigItemDialogContext, ConfigItemDetailsContext } from '../../core';
import { ConfigItemProperty } from '../../../model/ConfigItemProperty';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { DialogService } from '../../../../../modules/base-components/webapp/core/DialogService';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ValidationSeverity } from '../../../../../modules/base-components/webapp/core/ValidationSeverity';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../../model/ContextMode';
import { RoutingService } from '../../../../../modules/base-components/webapp/core/RoutingService';
import { ConfigItemClass } from '../../../model/ConfigItemClass';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { ConfigItemClassProperty } from '../../../model/ConfigItemClassProperty';
import { ValidationResult } from '../../../../../modules/base-components/webapp/core/ValidationResult';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { Error } from '../../../../../../../server/model/Error';
import { ContextType } from '../../../../../model/ContextType';
import { ConfigItem } from '../../../model/ConfigItem';

class Component {

    private state: ComponentState;

    private classId: number;

    public onCreate(): void {
        this.state = new ComponentState();
        this.state.loadNodes = this.load.bind(this);
    }

    private load(): Promise<TreeNode[]> {
        return CMDBService.getInstance().getTreeNodes(ConfigItemProperty.CLASS_ID);
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Cancel', 'Translatable#Config Item Class', 'Translatable#Save'
        ]);

        this.state.placeholder = await TranslationService.translate('Translatable#Select Config Item Class');

        const hint = await TranslationService.translate('Translatable#Helptext_CMDB_ConfigItemCreate_Class');
        this.state.hint = hint.startsWith('Helptext_') ? null : hint;

        const context = ContextService.getInstance().getActiveContext();
        if (context && context.getDescriptor().contextType === ContextType.DIALOG) {
            const configItem = await context.getObject<ConfigItem>(KIXObjectType.CONFIG_ITEM);
            if (configItem) {
                this.state.hasObject = true;
                context.setAdditionalInformation('CI_CLASS_ID', configItem.ClassID);
                this.classId = configItem.ClassID;
                this.state.prepared = true;

                setTimeout(() => {
                    const treeHandler = TreeService.getInstance().getTreeHandler('new-ci-class-form-list');
                    if (treeHandler && this.state.hasObject) {
                        let nodes = treeHandler.getTree();
                        nodes = nodes.filter((n) => n.id === this.classId);
                        treeHandler.setTree(nodes);
                        treeHandler.setSelection(nodes, true, true, true);
                    }
                }, 500);
            }
        }
    }

    public async onDestroy(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
    }

    public async cancel(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
        DialogService.getInstance().closeMainDialog();
    }

    public async classChanged(nodes: TreeNode[]): Promise<void> {
        this.state.prepared = false;
        FormService.getInstance().deleteFormInstance(this.state.formId);

        if (nodes && nodes.length) {
            const context = await ContextService.getInstance().getContext<NewConfigItemDialogContext>(
                NewConfigItemDialogContext.CONTEXT_ID
            );
            if (context) {
                context.setAdditionalInformation('CI_CLASS_ID', nodes[0].id);
                this.classId = nodes[0].id;
                setTimeout(() => {
                    this.state.prepared = true;
                }, 50);
            }
        }

    }

    public async submit(): Promise<void> {
        if (this.state.formId) {

            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            const result = await formInstance.validateForm();
            const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);

            if (validationError) {
                this.showValidationError(result);
            } else {
                BrowserUtil.toggleLoadingShield(true, 'Translatable#Create Config Item');
                const cmdbService
                    = ServiceRegistry.getServiceInstance<CMDBService>(KIXObjectType.CONFIG_ITEM);

                const ciClass = await this.getCIClass(this.classId);
                await cmdbService.createConfigItem(this.state.formId, ciClass.ID)
                    .then((configItemId) => {
                        BrowserUtil.toggleLoadingShield(false);
                        BrowserUtil.openSuccessOverlay('Translatable#Config Item successfully created.');
                        DialogService.getInstance().submitMainDialog();
                        const routingConfiguration = new RoutingConfiguration(
                            ConfigItemDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM,
                            ContextMode.DETAILS, ConfigItemProperty.CONFIG_ITEM_ID, true
                        );
                        RoutingService.getInstance().routeToContext(routingConfiguration, configItemId);
                        ContextService.getInstance().updateObjectLists(KIXObjectType.CONFIG_ITEM);
                    }).catch((error: Error) => {
                        BrowserUtil.toggleLoadingShield(false);
                        BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                    });
            }
        }
    }

    private async getCIClass(classId: number): Promise<ConfigItemClass> {
        const classes = await KIXObjectService.loadObjects<ConfigItemClass>(
            KIXObjectType.CONFIG_ITEM_CLASS, [classId],
            new KIXObjectLoadingOptions(
                null, 'ConfigItemClass.Name', null, [ConfigItemClassProperty.CURRENT_DEFINITION]
            )
        );

        return classes && classes.length ? classes[0] : null;
    }

    private showValidationError(result: ValidationResult[]): void {
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

}

module.exports = Component;
