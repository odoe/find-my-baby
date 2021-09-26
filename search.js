let assets = [];
let page = 1;
const cnftUrl = 'https://api.cnft.io/market/listings';

// schema baby aliens
/**
0: {hat: 'None'}
1: {body: 'Brown'}
2: {eyes: 'Blue'}
3: {face: 'Bandaid'}
4: {mouth: 'Baby Pacifier'}
5: {clothes: 'Yellow Hoodie'}
6: {project: 'BabyAlienClub'}
7: {accessory: 'Confidential Case'}
8: {background: 'Cerulean'}
 */

export async function search({ pricemin, pricemax, traits }) {
    return new Promise((resolve) => {
        let pass = 0;

        async function findAliens(queryPage) {
            const query = {
                search: '',
                project: 'BabyAlienClub',
                sort: 'date',
                order: 'desc',
                pricemin,
                pricemax,
                page: queryPage,
                verified: true
            };
            
            let formBody = [];
            for (let p in query) {
                let encodedKey = encodeURIComponent(p);
                let encodedValue = encodeURIComponent(query[p]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            
            formBody = formBody.join("&");
            const response = await fetch(cnftUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: formBody
            });
            const data = await response.json();
            return data;
        }

        async function findNFTs() {
            const data = await findAliens(page);
            assets = [...assets, ...data.assets];
            if (pass === 0 && data.found > 25) {
                pass = 1;
                const totalPages = Math.ceil(data.found/25) - 1;
                assets = [...assets, ...data.assets];
                let promises = [];
                for (let i = 0; i <= totalPages; i++) {
                    page = page + 1;
                    promises.push(findAliens(page));
                }
                const results = await Promise.all(promises);
                assets = results.reduce((a, b) => {
                    return [...a, ...b.assets];
                }, assets);
            }
            let valid = assets.filter((x) => x.sold === false);
            if (traits) {
                valid = valid.filter((x) => {
                    return x.metadata.tags.some((a) => {
                        let isValid = false;
                        let noTraits = true;
                        for (let t in traits) {
                            if (traits[t].length) {
                                noTraits = false;
                                isValid = traits[t].includes(a[t]);
                            }
                        }
                        return isValid || noTraits;
                    });
                })
            }

            const results =
                valid.sort((a, b) => a.price < b.price ? -1 : 1).map((x) => resultFactory(x, traits))
            page = 1;
            assets = [];
            resolve(results);
        }

        findNFTs();
    });
}

function resultFactory(result) {
    return {
        id: result.id,
        price: result.price,
        name: result.metadata.name,
        tags: result.metadata.tags,
        thumbnail: result.metadata.thumbnail.replace('ipfs://', '')
    };
}