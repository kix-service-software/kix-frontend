(function () {
    document.addEventListener('readystatechange', function () {
        if (document.readyState === 'complete' && kixWebFormURL) {
            var startButtons = document.getElementsByClassName('kix-web-form-start-button');
            if (startButtons && !!startButtons.length) {
                for (var i = 0, button; button = startButtons[i]; i++) {
                    button.disabled = true;
                    var formId = button.id;
                    if (formId) {
                        loadContent(formId, button);
                    }
                }
            }
        }
    });
})();

var kixFormContent = {
    tooManyFilesErrorMsg: 'Not more than 5 files possible.',
    fileTooBigErrorMsg: 'is to large.',
    maxFileSize: 24000000
}
function loadContent(formId, button) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.buttonLabel && response.htmlString) {
                button.disabled = false;
                button.innerHTML = response.buttonLabel;
                if (response.fileTooBigErrorMsg) {
                    kixFormContent.fileTooBigErrorMsg = response.fileTooBigErrorMsg;
                }
                if (response.tooManyFilesErrorMsg) {
                    kixFormContent.tooManyFilesErrorMsg = response.tooManyFilesErrorMsg;
                }
                if (response.maxFileSize) {
                    kixFormContent.maxFileSize = response.maxFileSize;
                }
                button.addEventListener('click', function () {
                    openForm(formId, response.htmlString, response.modal);
                });
            }
        }
    };

    xhr.open('GET', kixWebFormURL + '/' + formId, true);
    xhr.send();
}

function showShield() {
    var shield = document.getElementById('kix-form-shield');
    if (!shield) {
        document.body.insertAdjacentHTML('beforeend', '<div id="kix-form-shield"></div>');
        shield = document.getElementById('kix-form-shield');
    }
    if (shield) {
        setTimeout(function () {
            shield.style.opacity = '0.5';
        }, 5);
    }
}

function openForm(formId, htmlString, modal) {
    var somekixFormElement = document.getElementsByClassName('kix-form-container')[0];
    if (!somekixFormElement) {
        if (modal) {
            showShield();
        }
        document.body.insertAdjacentHTML('beforeend', htmlString);

        setTimeout(function () {
            var formElement = document.getElementById("kix-form-" + formId);
            if (formElement) {
                var nameInput = document.getElementById('kix-form-name-' + formId);
                if (nameInput) {
                    nameInput.focus();
                }
                var submitButton = document.getElementById('kix-form-submit-button-' + formId);
                if (submitButton) {
                    submitButton.addEventListener('click', function () {
                        submitForm(formId, formElement);
                    });
                }
                var cancelButton = document.getElementById('kix-form-cancel-button-' + formId);
                if (cancelButton) {
                    cancelButton.addEventListener('click', function () {
                        closeForm(formElement);
                    });
                }
                var closeButton = formElement.getElementsByClassName('kix-form-close')[0];
                if (closeButton) {
                    closeButton.addEventListener('click', function () {
                        closeForm(formElement);
                    });
                }
                var attachmentInput = document.getElementById('kix-form-attachments-' + formId);
                if (attachmentInput) {
                    attachmentInput.addEventListener('change', function () {
                        checkFiles(formElement, attachmentInput.files);
                        showFiles(formId, attachmentInput.files);
                    });
                }
            }
        }, 50);
    }
}

var loadedFiles = [];
var notLoadedFilesCount = 0;
function submitForm(formId, formElement) {
    loadedFiles = [];
    notLoadedFilesCount = 0;
    if (kixWebFormURL && formId && formElement) {
        setFormNotUsableState(formId, formElement, true);

        var files = getFiles(formId);
        if (files && !!files.length) {
            var error = checkFiles(formElement, files);
            if (error) {
                setFormNotUsableState(formId, formElement, false);
            } else {
                for (var i = 0; i < files.length; i++) {
                    readFile(formId, formElement, files, i);
                }
            }
        } else {
            sendPostRequest(formId, formElement);
        }
    }
}

function setFormNotUsableState(formId, formElement, notUsable) {
    var contentElement = formElement.getElementsByClassName('kix-form-content')[0];
    if (contentElement) {
        var submitButton = document.getElementById('kix-form-submit-button-' + formId);
        if (submitButton) {
            submitButton.disabled = notUsable;
        }
        var inputs = contentElement.getElementsByTagName('input');
        for (var i = 0, input; input = inputs[i]; i++) {
            input.readonly = notUsable;
            input.disabled = notUsable;
        }
        var textareas = contentElement.getElementsByTagName('textarea');
        for (var a = 0, textarea; textarea = textareas[a]; a++) {
            textarea.readonly = notUsable;
            textarea.disabled = notUsable;
        }
    }
}

function checkFiles(formElement, files) {
    var error = false;
    showRessultMessage(formElement, '');
    if (files && !!files.length) {
        if (files.length > 5) {
            showRessultMessage(formElement, kixFormContent.tooManyFilesErrorMsg, true);
            error = true;
        } else {
            for (var i = 0, file; file = files[i]; i++) {
                if (file.size > kixFormContent.maxFileSize) {
                    showRessultMessage(formElement, file.name + ': ' + kixFormContent.fileTooBigErrorMsg, true);
                    error = true;
                    break;
                }
            }
        }
    }
    return error;
}

function showFiles(formId, files) {
    var attachmentContainer = document.getElementById('kix-form-attachment-container-' + formId);
    if (attachmentContainer) {
        attachmentContainer.style.display = 'none';
        attachmentContainer.innerHTML = '';
        if (files && !!files.length) {
            if (files.length > 1) {
                attachmentContainer.style.display = 'block';
            }
            for (var i = 0; i < files.length; i++) {
                var param = document.createElement('p');
                var fileSize = getReadableFileSize(files[i].size)
                param.textContent = files[i].name + ' (' + fileSize + ')';
                param.title = files[i].name + ' (' + fileSize + ')';
                attachmentContainer.appendChild(param);
            }
        }
    }
}

function getReadableFileSize(number) {
    if (number < 1000) {
        return number + 'bytes';
    } else if (number >= 1000 && number < 1000000) {
        return (number / 1000).toFixed(1) + 'kB';
    } else if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'MB';
    }
}

function getInputValue(formId, inputClass) {
    var inputElement = document.getElementById(inputClass + formId);
    if (inputElement) {
        return inputElement.value;
    }

    return null;
}

function getFiles(formId) {
    var attachmentInput = document.getElementById('kix-form-attachments-' + formId);
    if (attachmentInput) {
        return attachmentInput.files;
    }
    return [];
}

function sendPostRequest(formId, formElement) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                var response = JSON.parse(xhr.responseText);
                handleSuccess(formElement, response.successMessage);
            } else {
                showRessultMessage(formElement, (xhr.responseText ? xhr.responseText : 'something went wrong.'), true);
                setFormNotUsableState(formId, formElement, false);
            }
        }
    };

    var ticket = {
        name: getInputValue(formId, 'kix-form-name-'),
        email: getInputValue(formId, 'kix-form-email-'),
        subject: getInputValue(formId, 'kix-form-subject-'),
        message: getInputValue(formId, 'kix-form-message-'),
        files: loadedFiles ? loadedFiles : []
    }

    xhr.open("POST", kixWebFormURL + '/' + formId, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(ticket));
}

function readFile(formId, formElement, files, index) {
    var reader = new FileReader();
    reader.onload = function () {
        let content = reader.result.toString();
        loadedFiles.push({
            name: files[index].name,
            size: files[index].size,
            type: files[index].type,
            content: content.split(',')[1],
            lastModified: files[index].lastModified,
            lastModifiedDate: files[index].lastModifiedDate
        })
        if (loadedFiles.length >= (files.length - notLoadedFilesCount)) {
            sendPostRequest(formId, formElement);
        }
    };
    reader.onerror = function (event) {
        reader.abort();
        notLoadedFilesCount++;
        if (loadedFiles.length >= (files.files - notLoadedFilesCount)) {
            sendPostRequest(formId, formElement);
        }
    }
    reader.readAsDataURL(files[index]);
}

function closeForm(formElement) {
    document.body.removeChild(formElement);
    var shield = document.getElementById('kix-form-shield');
    if (shield) {
        shield.style.opacity = 0;
        setTimeout(function () {
            document.body.removeChild(shield);
        }, 250);
    }
}

function handleSuccess(formElement, successMessage) {
    if (formElement) {
        var contentElement = formElement.getElementsByClassName('kix-form-content')[0];
        if (contentElement) {
            formElement.removeChild(contentElement);
        }
        showRessultMessage(formElement, successMessage);
    }
}

function showRessultMessage(formElement, message, asError) {
    if (formElement) {
        var resultElement = formElement.getElementsByClassName('kix-form-result-message')[0];
        if (resultElement) {
            resultElement.innerHTML = '';
            var pElement = document.createElement('p');
            if (asError) {
                pElement.style.color = '#f00';
            }
            pElement.textContent = asError ? 'Error: ' + message : message;
            resultElement.appendChild(pElement);
        }
    }
}