# Actions

Am Beispiel von LinkedObjectsEditAction.

## Action implementieren

* Action muss von `AbstractAction` ableiten

```javascript
export class LinkedObjectsEditAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(event: any): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        ContextService.getInstance().setDialogContext(null, KIXObjectType.LINK, ContextMode.EDIT_LINKS);
    }

}
```

* innerhalb vom relevanten Service registieren

```javascript
ActionFactory.getInstance()
    .registerAction('linked-objects-edit-action', LinkedObjectsEditAction);
```
