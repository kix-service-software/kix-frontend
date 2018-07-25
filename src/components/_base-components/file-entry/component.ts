class ArticleAttachmentComponent {

    public onClick(): void {
        (this as any).emit('fileClicked');
    }

}

module.exports = ArticleAttachmentComponent;
