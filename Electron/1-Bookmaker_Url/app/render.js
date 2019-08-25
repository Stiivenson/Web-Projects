//We’ll use this after fetching the text contents of the provided URL.
const parser = new DOMParser(); 

//Requiring Electron’s shell module - to let user choose browser to open link.
const {shell} = require('electron');

const linksSection = document.querySelector('.links'),
    errorMessage = document.querySelector('.error_message'),
    newLinkForm = document.querySelector('.new_link_form'),
    newLinkUrl = document.querySelector('.new_link_url'),
    newLinkSubmit = document.querySelector('.new_link_submit'),
    clearStorageButton = document.querySelector('.clear_storage');

newLinkUrl.addEventListener('keyup', () => {
    newLinkSubmit.disabled = !newLinkUrl.validity.valid;
});

clearStorageButton.addEventListener('click', () => {
    localStorage.clear();
    linksSection.innerHTML = '';
});

newLinkForm.addEventListener('submit', () => {
    event.preventDefault();
    const url = newLinkUrl.value;

    //Uses the Fetch API to fetch the content of the provided URL. And Parses the responseas plain text.
    fetch(url)
    .then(validateResponse)
    .then(respone => respone.text())
    .then(parseResponse)
    .then(findTitle)
    .then(title => storeLink(title,url))
    .then(clearForm)
    .then(renderLinks)
    .catch(error => handlerError(error,url));
});


//Validating responses from remote servers.
const validateResponse = (response) => {
    //If the response was successful, passes it along to the next promise.
    if (response.ok) {return response;}
    //Throws an error if the request received a 400- or 500-series response.
    throw new Error (`Status code of ${response.status} 
        ${response.statusText}`);
}

//Takes the string of HTML from the URL and parses it into a DOM tree.
const parseResponse = (text) => {
    return parser.parseFromString(text, 'text/html');
};

//Traverses the DOM tree to find the <title> node.
const findTitle = (nodes) => {
    return nodes.querySelector('title').innerText;
};

//Stores the title and URL into localStorage.
const storeLink = (title,url) => {
    localStorage.setItem(url, JSON.stringify({title: title, url: url}));
};

const clearForm = () => {
    newLinkUrl.value = null;
};

//Gets an array of all the keys currently stored in localStorage.
//For each key, gets its value and parses it from JSON into a JavaScript object.
const getLinks = () => {
    return Object.keys(localStorage) 
        .map(key => JSON.parse(localStorage.getItem(key)));
};

const convertToElemnt = (link) => {
    return `
        <div class="link">
            <h3>${link.title}</h3>
            <p>
                <a href="${link.url}">${link.url}</a>
            </p>
        </div> 
    `;
};

//Converts all the links to HTML elements and combines them.
//Replaces the contents of the links section with the combined link elements.
const renderLinks = () => {
    const linkElements = getLinks().map(convertToElemnt).join('');
    linksSection.innerHTML = linkElements;
};

//Displaying an error message.
const handlerError = (error, url) =>{
    //Sets the contents of the error message element if fetching a link fails.
    errorMessage.innerHTML = `
    There was an issue adding "${url}": ${error.message}`.trim();
    //Clears the error message after 5 seconds.
    setTimeout(() => errorMessage.innerText = null, 5000);
};

renderLinks();

//Opening links in the user’s default browser
linksSection.addEventListener('click', (event) => {
    //Checks to see if the element that was clicked was a link by looking for an href attribute
    if (event.target.href) {
        event.preventDefault();
        //Uses Electron’s shell module to open a link in the user’s default browser
        shell.openExternal(event.target.href);
    }
});