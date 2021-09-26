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
        async function findNFTs() {
            const query = {
                search: '',
                project: 'BabyAlienClub',
                sort: 'date',
                order: 'desc',
                pricemin,
                pricemax,
                page,
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
            console.log('page number', page);
            assets = [...assets, ...data.assets];
            if (data.assets.length < 1) {
                console.log('done', assets.length);
                let valid = assets.filter((x) => x.sold === false)

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
        
            } else {
                page = page + 1;
                findNFTs(traits)
            }
        }

        findNFTs();
    });
}

function resultFactory(result, traits) {
    return {
        id: result.id,
        price: result.price,
        name: result.metadata.name,
        tags: result.metadata.tags,
        thumbnail: result.metadata.thumbnail.replace('ipfs://', '')
    };
}