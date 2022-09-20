"use strict";

const e_usernameOutput = document.getElementById('usernameOutput');
const e_usernameList = document.getElementById('usernameList');
const e_usernameModalList = document.getElementById('usernameModalList');
const e_usernameModal = document.getElementById('usernameModal');
const e_usernameModalCloseButton = document.getElementById('usernameModalCloseButton');

const e_buttonClipboard = document.getElementById('buttonClipboard');
const e_buttonRegenerate = document.getElementById('buttonRegenerate');
const e_buttonHeart = document.getElementById('buttonHeart');

const e_togglePseudoword = document.getElementById('togglePseudoword');
const e_toggleMixword = document.getElementById('toggleMixword');

const e_sliderLength = document.getElementById('sliderLength');
const e_sliderLengthDisplay = document.getElementById('sliderLengthDisplay');
const e_usernamesCard = document.getElementsByClassName('card-usernames')[0];

const e_wordSelect = document.getElementById('wordSelect');
const e_checkAdjectives = document.getElementById('checkAdjectives');
const e_checkDigits = document.getElementById('checkDigits');
const e_checkCamelCase = document.getElementById('checkCamelCase');

const generationData = {
    adjectives: [],
    animals: [],
    colors: [],
    nouns: [],
    verbs: [],
}

const numberGenerator = new MIG(1, 9999);

// load all data
Promise.all([
    fetch("./assets/data/adjectives.txt").then(x => x.text()),
    fetch("./assets/data/animals.txt").then(x => x.text()),
    fetch("./assets/data/colors.txt").then(x => x.text()),
    fetch("./assets/data/nouns.txt").then(x => x.text()),
    fetch("./assets/data/verbs.txt").then(x => x.text())
]).then(([adjectives, animals, colors, nouns, verbs]) => {
    generationData.adjectives = adjectives.split('\n');
    generationData.animals = animals.split('\n');
    generationData.colors = colors.split('\n');
    generationData.nouns = nouns.split('\n');
    generationData.verbs = verbs.split('\n');
});

/**
 * Randomly pick an element from given array.
 * @param  {Array} array Input array.
 * @return {any} Random item from the array.
 */
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Joins an array into a string in camelCase.
 * @param  {Array} arr Input array.
 * @return {String} Returned value.
 */
function camelCaseJoin(arr) {
    let _string = arr[0];
    for (let i = 1; i < arr.length; i++) {
        _string += arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    return _string;
}

/**
 * Generates an username by mixing words together in adjective + noun form.
 * @param {Number} length Number of words to combine.
 * @param {Boolean} camelCase Whether to camelCase the username.
 * @returns {String} Generated username.
 */
function generateMixwordUsername(length, camelCase) {
    let _username = [];
    if (e_checkAdjectives.checked) {
        _username.push(randomChoice(generationData.adjectives));
    }
    if (length > 2)
        _username.push(randomChoice(generationData.verbs));
    if (length > 1) {
        if (e_wordSelect.value === 'colors') {
            _username.push(randomChoice(generationData.colors));
        } else if (e_wordSelect.value === 'animals') {
            _username.push(randomChoice(generationData.animals));
        } else {
            _username.push(randomChoice(generationData.nouns));
        }
    }

    if (e_checkDigits.checked) {
        _username.push(numberGenerator.generate().toString());
    }


    if (camelCase) {
        return camelCaseJoin(_username);
    } else {
        return _username.join('');
    }
}

function generatePseudowordUsername(length) {
    let _username = GPW.pronounceable(length);
    if (e_checkDigits.checked) {
        let _generatedNum = numberGenerator.generate().toString();
        _username += _generatedNum;
        e_sliderLengthDisplay.innerHTML = `Length [${e_sliderLength.value} <span class="tinyred">+ ${_generatedNum.length}</span>]`;
    }
    return _username;
}

let heartedUsernames = [];
let generatedUsernames = [];
if (heartedUsernames.length == 0) {
    e_usernamesCard.style.display = "none";
}

e_buttonHeart.addEventListener('click', () => {
    let _username = e_usernameOutput.innerText.substring(1);
    if (!heartedUsernames.includes(_username)) {
        heartedUsernames.push(_username);
        let _listItem = document.createElement('li');
        _listItem.innerText = _username;
        e_usernameList.appendChild(_listItem);
        let _modalListItem = document.createElement('li');
        _modalListItem.innerText = _username;
        e_usernameModalList.appendChild(_modalListItem);
        // add to modal
        let _crossMark = document.createElement('i');
        _crossMark.classList.add('fa', 'fa-fw', 'fa-xmark');
        _crossMark.onclick = () => {
            heartedUsernames.splice(heartedUsernames.indexOf(_username), 1);
            _listItem.remove();
            _modalListItem.remove();
            // hide the saved usernames card if there are no saved usernames
            if (heartedUsernames.length === 0) {
                e_usernamesCard.style.display = "none";
            }
        };
        _modalListItem.appendChild(_crossMark);
    }
    if (e_usernamesCard.style.display === 'none') {
        e_usernamesCard.style.display = "block";
    }
});

e_usernamesCard.addEventListener('click', () => {
    e_usernameModal.style.display = 'block';
});

e_usernameModalCloseButton.addEventListener('click', () => {
    e_usernameModal.style.display = 'none';
});

e_togglePseudoword.addEventListener('click', () => {
    toggleGenerator('pseudoword');
});

e_toggleMixword.addEventListener('click', () => {
    toggleGenerator('mixword');
});

e_sliderLength.addEventListener('input', () => {
    e_sliderLengthDisplay.innerText = `Length [${e_sliderLength.value}]`;
});

var currentGenerator = '';
e_buttonRegenerate.addEventListener('click', () => {
    generateUsername();
});

e_checkDigits.addEventListener('change', (e) => {
    if (!e.target.checked) {
        e_sliderLengthDisplay.innerText = `Length [${e_sliderLength.value}]`;
    }
});

e_buttonClipboard.addEventListener('click', () => {
    let _dummy = document.createElement('textarea');
    document.body.appendChild(_dummy);
    _dummy.value = generatedUsernames[generatedUsernames.length - 1];
    _dummy.select();
    _dummy.setSelectionRange(0, 99999);
    document.execCommand("copy");
    alert("Copied to clipboard.");
    document.body.removeChild(_dummy);
});

function generateUsername() {
    let _username = '';
    if (currentGenerator === 'pseudoword') {
        _username = generatePseudowordUsername(e_sliderLength.value);
    }
    else {
        _username = generateMixwordUsername(e_sliderLength.value, e_checkCamelCase.checked);
    }
    e_usernameOutput.innerText = '@' + _username;
    generatedUsernames.push(_username);
}

function toggleGenerator(gen) {
    currentGenerator = gen;
    if (currentGenerator === 'pseudoword') {
        e_togglePseudoword.classList.add('toggle-active');
        e_toggleMixword.classList.remove('toggle-active');
        e_sliderLength.max = 15;
        e_sliderLength.min = 3;
        e_sliderLength.value = 8;
        e_sliderLengthDisplay.innerText = `Length [${e_sliderLength.value}]`;

        // To Do: Toggle an invisible class instead.
        e_wordSelect.style.visibility = 'hidden';
        e_checkAdjectives.parentElement.style.visibility = 'hidden';
        e_checkCamelCase.parentElement.style.visibility = 'hidden';
    }
    else {
        e_toggleMixword.classList.add('toggle-active');
        e_togglePseudoword.classList.remove('toggle-active');
        e_sliderLength.max = 5;
        e_sliderLength.min = 2;
        e_sliderLength.value = 2;
        // To Do: "Word Length [xx]"
        e_sliderLengthDisplay.innerText = `Length [${e_sliderLength.value}]`;

        e_wordSelect.style.visibility = 'visible';
        e_checkAdjectives.parentElement.style.visibility = 'visible';
        e_checkCamelCase.parentElement.style.visibility = 'visible';
    }
}

toggleGenerator('pseudoword');
generateUsername();