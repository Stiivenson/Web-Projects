//Load module to read marked txt
const marked = require('marked');
//Load module to prevent XSS-atacks
const createDOMPurify = require('dompurify'),
      { JSDOM } = require('jsdom');
const window = (new JSDOM('')).window,
    DOMPurify = createDOMPurify(window);
//Requiring functions from the main process
const {remote, ipcRenderer} = require('electron'),
    mainProcess = remote.require('./main.js'),
    //Getting a reference to the current window in the renderer process
    currentWindow = remote.getCurrentWindow();
//Declaring global variables for keeping track of the current file
let filePath = null,
    originalContent = '';
const path = require('path');

const markdownView = document.querySelector('#markdown'),
      htmlView = document.querySelector('#html'),
      newFileBtn = document.querySelector('#new_file'),
      openFileBtn = document.querySelector('#open_file'),
      saveMarkdownBtn = document.querySelector('#save_markdown'),
      revertBtn = document.querySelector('#revert'),
      saveHtmlBtn = document.querySelector('#save_html'),
      showFileBtn = document.querySelector('#show_file'),
      openInDefaultBtn = document.querySelector('#open_in_default');

//Converting Markdown to HTML
const renderMarkdownToHTML = (markdown) => {
    //To protect ourselves from accidental script injections - sanitize func
    const clear = DOMPurify.sanitize(marked(markdown));
    htmlView.innerHTML = clear;
};

//Re-rendering the HTML when Markdown changes
markdownView.addEventListener('keyup', (event) => {
    const currentContent = event.target.value;
    renderMarkdownToHTML(currentContent);
    updateUserInterface(currentContent !== originalContent);
});

openFileBtn.addEventListener('click', () => {
    mainProcess.getFileFromUser(currentWindow);
});

newFileBtn.addEventListener('click', () => {
    mainProcess.createWindow();
});

saveHtmlBtn.addEventListener('click', () => {
    mainProcess.saveHtml(currentWindow, htmlView.innerHTML);
});

saveMarkdownBtn.addEventListener('click', () => {
    mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value);
});

revertBtn.addEventListener('click', () => {
    markdownView.value = originalContent;
    renderMarkdownToHTML(originalContent);
});

//Refactoring the process of displaying a new file
const renderFile = (file, content) => {
    filePath = file;
    originalContent = content;

    markdownView.value = content;
    renderMarkdownToHTML(content);
    updateUserInterface(false);
};

//Listening for messages on the file-opened channel
ipcRenderer.on('file-opened', (event, file, content, isEdited) => {
    if (isEdited) {
        remote.dialog.showMessageBox(currentWindow,{
            type: 'warning',
            title: 'Overwrite Current Unsaved Changes?',
            message: 'Opening a new file in this window will overwrite your unsaved changes. Open this file anyway?',
            buttons: [ 'Yes', 'Cancel' ],
            defaultId: 0,
            cancelId: 1
        }).then(result => {
            console.log(result.response);
            if (result.response === 1) return;
            else renderFile(file, content);
        }).catch(err => {
            console.log(err);
        })
    } else
        renderFile(file, content);    
});

//Prompting the user when a file changes
ipcRenderer.on('file-changed', (event, file, content) => {
    remote.dialog.showMessageBox(currentWindow,{
        type: 'warning',
        title: 'Overwrite Current Unsaved Changes?',
        message: 'Another application has changed this file. Load changes?',
        buttons: [ 'Yes', 'Cancel' ],
        defaultId: 0,
        cancelId: 1
    }).then(result => {
        if (result.response === 1) return;
        renderFile(file, content);
    }).catch(err => {
        console.log(err);
    })
});

//Updating the window title based on the current file
const updateUserInterface = (isEdited) => {
    let title = 'Fire Sale';
    //If a file is open, prepends the name of that file to the title
    if (filePath) { title = `${path.basename(filePath)} - ${title}`;}
    if (isEdited) {title = `${title} (Edited)`;}

    currentWindow.setTitle(title);
    currentWindow.setDocumentEdited(isEdited);
    mainProcess.isFileEdited(currentWindow, isEdited);

    saveMarkdownBtn.disabled = !isEdited;
    revertBtn.disabled = !isEdited; 
};

document.addEventListener('dragstart', event => event.preventDefault());
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('dragleave', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

//This will always be an array in case the user selects multiple items. The application supports only one file at a time. We grab the first item in the array
const getDraggedFile = (event) => event.dataTransfer.items[0];
//This is similar to the getDraggedFile(), but after the user has officially dropped the file, we have access to the file itself, not just its metadata
const getDroppedFile = (event) => event.dataTransfer.files[0];
//This helper function returns true or false if the file’s type is in the array of supported file types
const fileTypeIsSupported = (file) => {
    return ['text/plain', 'text/markdown'].includes(file.type);
};

//Adding and removing classes on dragover and dragleave
markdownView.addEventListener('dragover', (event) => {
    const file = getDraggedFile(event);
    if (fileTypeIsSupported(file))
        markdownView.classList.add('drag-over');
    else    
        markdownView.classList.add('drag-error');
});
markdownView.addEventListener('dragleave', () => {
    markdownView.classList.remove('drag-over');
    markdownView.classList.remove('drag-error');
});

//Drag-and-drop functionality
markdownView.addEventListener('drop', (event) => {
    const file = getDroppedFile(event);
    if (fileTypeIsSupported(file))
        mainProcess.openFile(currentWindow, file.path);
    else    
        alert('That typeis not supported!');

    markdownView.classList.remove('drag-over');
    markdownView.classList.remove('drag-error');
});