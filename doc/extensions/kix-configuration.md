#### kix:configuration

Pseudo Code:
```javascript
export class ExampleExtension implements IConfigurationExtension {

                    public getModuleId(): string {
                        return 'MyContextID';
                    }

                    public getDefaultConfiguration(): Promise<ContextConfiguration> {
                        await ModuleConfigurationService.getInstance().saveConfiguration(
 new ContextConfiguration(
                            this.getModuleId(),
                            ['sidebar01', 'sidebar02'], [sidebarConfig01, sidebarConfig02],
                            ['explorer01'], [explorerConfig01],
                            ['lane01'], [lane01Config],
                            ['lanTab01'], [lanTab01Config],
                            ['content01'], [content01Config],
                            ['action01', 'action02'], ['subAction01', 'subAction02'],
                            [overlayWidgetConfig01]
                        )
                    }

                    public createFormDefinitions(overwrite: boolean): Promise<void> {
                        // create and register a form configuration
                    }

}
```