import {
    Context, ConfiguredWidget, WidgetConfiguration, WidgetType, BreadcrumbInformation, KIXObject,
    KIXObjectType, KIXObjectCache, Translation, KIXObjectLoadingOptions, TranslationProperty
} from "../../../../../model";
import { TranslationDetailsContextConfiguration } from "./TranslationDetailsContextConfiguration";
import { AdminContext } from "../../../../admin";
import { LabelService } from "../../../../LabelService";
import { TranslationService } from "../../../TranslationService";
import { EventService } from "../../../../event";
import { ApplicationEvent } from "../../../../application";

export class TranslationDetailsContext extends Context<TranslationDetailsContextConfiguration> {

    public static CONTEXT_ID = 'i18n-translation-details';

    public getIcon(): string {
        return 'kix-icon-gear';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<Translation>(), true, !short);
    }

    public getLanes(show: boolean = false): ConfiguredWidget[] {
        let lanes = this.configuration.laneWidgets;

        if (show) {
            lanes = lanes.filter(
                (l) => this.configuration.lanes.findIndex((lid) => l.instanceId === lid) !== -1
            );
        }

        return lanes;
    }

    public getLaneTabs(show: boolean = false): ConfiguredWidget[] {
        let laneTabs = this.configuration.laneTabWidgets;

        if (show) {
            laneTabs = laneTabs.filter(
                (lt) => this.configuration.sidebars.findIndex((ltId) => lt.instanceId === ltId) !== -1
            );
        }

        return laneTabs;
    }

    public getContent(show: boolean = false): ConfiguredWidget[] {
        let content = this.configuration.contentWidgets;

        if (show && content) {
            content = content.filter(
                (l) => this.configuration.content.findIndex((cid) => l.instanceId === cid) !== -1
            );
        }

        return content;
    }

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        let configuration: WidgetConfiguration<WS>;

        const laneWidget = this.configuration.laneWidgets.find((lw) => lw.instanceId === instanceId);
        configuration = laneWidget ? laneWidget.configuration : undefined;

        if (!configuration) {
            const laneTabWidget = this.configuration.laneTabWidgets.find((ltw) => ltw.instanceId === instanceId);
            configuration = laneTabWidget ? laneTabWidget.configuration : undefined;
        }

        if (!configuration) {
            const contentWidget = this.configuration.contentWidgets.find((cw) => cw.instanceId === instanceId);
            configuration = contentWidget ? contentWidget.configuration : undefined;
        }

        return configuration;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        let widgetType: WidgetType;

        const laneWidget = this.configuration.laneWidgets.find((lw) => lw.instanceId === instanceId);
        widgetType = laneWidget ? WidgetType.LANE : undefined;

        if (!widgetType) {
            const laneTabWidget = this.configuration.laneTabWidgets.find((ltw) => ltw.instanceId === instanceId);
            widgetType = laneTabWidget ? WidgetType.LANE_TAB : undefined;
        }

        return widgetType;
    }

    public getBreadcrumbInformation(): BreadcrumbInformation {
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID]);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.TRANSLATION, reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        let translation;

        if (!objectType) {
            objectType = KIXObjectType.TRANSLATION;
        }

        if (reload && objectType === KIXObjectType.TRANSLATION) {
            KIXObjectCache.removeObject(KIXObjectType.TRANSLATION, Number(this.objectId));
        }

        if (!KIXObjectCache.isObjectCached(KIXObjectType.TRANSLATION, Number(this.objectId))) {
            translation = await this.loadTranslation();
        } else {
            translation = KIXObjectCache.getObject(KIXObjectType.TRANSLATION, Number(this.objectId));
        }

        return translation;
    }

    private async loadTranslation(): Promise<Translation> {
        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: true, hint: 'Lade Übersetzung ...' }
        );

        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, null, null, [TranslationProperty.LANGUAGES]
        );

        const translations = await TranslationService.getInstance().loadObjects<Translation>(
            KIXObjectType.TRANSLATION, [this.objectId], loadingOptions
        );

        const translation = translations && translations.length ? translations[0] : null;
        this.listeners.forEach(
            (l) => l.objectChanged(this.objectId, translation, KIXObjectType.TRANSLATION, [])
        );

        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: false, hint: 'Lade Übersetzung ...' }
        );
        return translation;
    }

}
