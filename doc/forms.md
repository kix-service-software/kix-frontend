# KIX Formulare

Am Beispiel FAQ Artikel erstellen.

## Formulardefinition erstellen

In der Extensionimplementierung des Kontextes muss die Methode ` createFormDefinitions(overwrite: boolean)` implementiert werden.

```javascript
public async createFormDefinitions(overwrite: boolean): Promise<void> {
    const configurationService =
        ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

    const formId = 'new-faq-article-form';
    const existingForm = configurationService.getModuleConfiguration(formId, null);
    if (!existingForm || overwrite) {
        const fields: FormField[] = [];
        fields.push(new FormField('Translatable#Title', FAQArticleProperty.TITLE, true, 'Translatable#Title'));

        const group = new FormGroup('Translatable#FAQ Data', fields);

        const form = new Form(formId, 'Translatable#New', [group], KIXObjectType.FAQ_ARTICLE);
        await configurationService.saveModuleConfiguration(form.id, null, form);
    }
    configurationService.registerForm([FormContext.NEW], KIXObjectType.FAQ_ARTICLE, formId);
}
```

- Hinweis: ein Formular kann auch nachträglich hinzugefügt werden (ist aber nicht der präferierte Weg!)

```javascript
FormService.getInstance().addform(
    new Form(
        this.formId,
        'Neue FAQ',
        formGroups, KIXObjectType.FAQ_ARTICLE, true,
        FormContext.NEW
    )
);
```

## Formular einbinden

```html
<main-form formId='new-faq-article-form'/>
```

## Eingabefelder registrieren/zuweisen
Im `FAQService`:

```javascript
FormInputRegistry.getInstance().registerFormInputComponent(new FormInputComponentDefinition(
    FAQArticleProperty.FIELD_1, KIXObjectType.FAQ_ARTICLE, 'rich-text-input', 'Symptom'
));

FormInputRegistry.getInstance().registerFormInputComponent(new FormInputComponentDefinition(
    FAQArticleProperty.VALID_ID, KIXObjectType.FAQ_ARTICLE, 'valid-input', 'validity'
));
```

## FormService erstellen und registieren

- ggf. muss die `GetValue`-Methode von `KIXObjectFormService` in diesem Service überschrieben werden
```javascript
export class FAQArticleFormService extends KIXObjectFormService<FAQArticle> {
    ...
}
```

### Formservice in der Modul-Komponente (`src/components/faq/faq-module-component`) registrieren

```javascript
ServiceRegistry.getInstance().registerServiceInstance(FAQArticleFormService.getInstance());
```