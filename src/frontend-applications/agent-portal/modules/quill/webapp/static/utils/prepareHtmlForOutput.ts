function prepareHtmlForOutput(html): any {
    return html.replace(
        /<table([^>]*)>([\s\S]*?)<\/table>/gi,
        (_match, attrs, innerHtml) => {
            const inlineTableStyles = [
                'border-collapse: collapse',
                'border-spacing: 0',
                'width: 100%',
                'border: 1px solid #bfbfbf'
            ].join('; ');

            const cleanedInner = innerHtml.replace(
                /<(td|th)([^>]*)>([\s\S]*?)<\/\1>/gi,
                (_cellMatch, tag, attrs, content) => {
                    const flatContent = content
                        .replace(/<p[^>]*>/gi, '')
                        .replace(/<\/p>/gi, '')
                        .trim();

                    const cleanedAttrs = attrs.replace(/\s*style="[^"]*"/gi, '');
                    return `<${tag}${cleanedAttrs} style="border: 1px solid #bfbfbf; padding: 6px;">${flatContent}</${tag}>`;
                }
            );

            return `<table style="${inlineTableStyles}">${cleanedInner}</table>`;
        }
    );
}

module.exports = { prepareHtmlForOutput };