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
});

openFileBtn.addEventListener('click', () => {
    mainProcess.getFileFromUser(currentWindow);
});

newFileBtn.addEventListener('click', () => {
    mainProcess.createWindow();
});

//Listening for messages on the file-opened channel
ipcRenderer.on('file-opened', (event, file, content) => {
    markdownView.value = content;
    renderMarkdownToHTML(content);
});