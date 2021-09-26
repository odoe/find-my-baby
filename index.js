import { search } from './search.js';

import {
    face,
    accessory,
    hat,
    mouth,
    background,
    body,
    eyeColor,
    clothes
} from './tags.js';

// const traitsContainer = document.getElementById('traits');
const resultsContainer = document.getElementById('results');
const searchBtn = document.getElementById('search');
const minPriceInput = document.getElementById('minprice');
const maxPriceInput = document.getElementById('maxprice');
const waiting = document.getElementById('waiting');

// traits containers
const faceTraits = document.getElementById('face');
const accTraits = document.getElementById('accessory');
const hatTraits = document.getElementById('hat');
const mouthTraits = document.getElementById('mouth');
const bgTraits = document.getElementById('background');
const bodyTraits = document.getElementById('body');
const eyesTraits = document.getElementById('eyes');
const clothesTraits = document.getElementById('clothes');

const mapping = [
    [face, faceTraits, 'face'],
    [accessory, accTraits, 'accessory'],
    [hat, hatTraits, 'hat'],
    [mouth, mouthTraits, 'mouth'],
    [background, bgTraits, 'background'],
    [body, bodyTraits, 'body'],
    [eyeColor, eyesTraits, 'eyes'],
    [clothes, clothesTraits, 'clothes']
];

const spinner = document.createElement('trinity-rings-spinner');

for (let trait of mapping) {
    const traitsFragment = document.createDocumentFragment();
    for (let a of trait[0]) {
        const checkbox = document.createElement('paper-checkbox');
        checkbox.classList.add('traits');
        checkbox.classList.add(trait[2]);
        checkbox.innerText = a
        traitsFragment.appendChild(checkbox);
    }
    trait[1].appendChild(traitsFragment);
}

searchBtn.addEventListener('click', async () => {
    const face = [...document.querySelectorAll('.face')].filter((x => x.checked)).map((a) => a.innerText);
    const accessory = [...document.querySelectorAll('.accessory')].filter((x => x.checked)).map((a) => a.innerText);
    const hat = [...document.querySelectorAll('.hat')].filter((x => x.checked)).map((a) => a.innerText);
    const mouth = [...document.querySelectorAll('.mouth')].filter((x => x.checked)).map((a) => a.innerText);
    const background = [...document.querySelectorAll('.background')].filter((x => x.checked)).map((a) => a.innerText);
    const body = [...document.querySelectorAll('.body')].filter((x => x.checked)).map((a) => a.innerText);
    const eyes = [...document.querySelectorAll('.eyes')].filter((x => x.checked)).map((a) => a.innerText);
    const clothes = [...document.querySelectorAll('.clothes')].filter((x => x.checked)).map((a) => a.innerText);

    const query = {
        pricemin: minPriceInput.value,
        pricemax: maxPriceInput.value,
        traits: {
            face,
            accessory,
            hat,
            mouth,
            background,
            body,
            eyes,
            clothes
        }
    };
    resultsContainer.innerHTML = '';
    waiting.appendChild(spinner);
    const results = await search(query);
    waiting.removeChild(spinner);
    elementFactory(results);
});

function elementFactory(results) {
    console.log('RESULTS', results);
    const fragment = document.createDocumentFragment();
    resultsContainer.innerHTML = `
        <h3>Total Results: ${results.length}</h3>
    `;
    for (let result of results) {
        const card = document.createElement('div');
        card.classList.add('card');
        const content = `
            <div class="card-content">
                <a href="https://www.cnft.io/token.php?id=${result.id}" target="_blank">
                <div class="card-content-img">
                    <div class="thumbnail">
                        <image lazy="true" class="thumbnail-img" src="https://ipfs.blockfrost.dev/ipfs/${result.thumbnail}"></image>
                        <h3 class="nft-name font-normal">${result.name}</h3>
                    </div>
                </div>
                </a>
                <div class="details">
                    Price: ${result.price/1000000} ada
                    <hr />
                    Traits: 
                    <br>
                    ${result.tags.map((x) => {
                        let elems = [];
                        for (let p in x) {
                            elems.push(`<label>${p}: ${x[p]}</label><br />`)
                        }
                        return elems;
                    }).join('')}
                </div>
            </div>
        `;
        card.innerHTML = content;
        fragment.appendChild(card);
    }
    resultsContainer.appendChild(fragment);
}
