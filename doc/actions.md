# Actions

Am Beispiel von LinkedObjectsEditAction.

## Action implementieren

* Action muss von `AbstractAction` ableiten

```javascript
export class LinkedObjectsEditAction extends AbstractAction {

    public initAction(displayText: boolean): void {
        this.text = "Bearbeiten";
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
    .registerAction('linked-objects-edit-action', LinkedObjectsEditAction);
```
