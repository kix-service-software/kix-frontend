# Actions

Am Beispiel von LinkEditAction.

## Action implementieren

* Action muss von `AbstractAction` ableiten

```javascript
export class LinkEditAction extends AbstractAction {

    public initAction(displayText: boolean): void {
        this.text = "Verknüpfungen bearbeiten";
        this.icon = "kix-icon-edit";
        this.displayText = displayText;
    }

    public run(): void {
        const context = ContextService.getInstance().getActiveContext();
        ContextService.getInstance().setDialogContext(null, KIXObjectType.LINK, ContextMode.EDIT_LINKS, context.objectId);
    }

}
```

* innerhalb vom relevanten Service registieren

```javascript
ActionFactory.getInstance()
    .registerAction('link-edit-action', LinkEditAction);
```
