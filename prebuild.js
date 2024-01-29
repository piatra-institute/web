const fs = require('fs');



const fetchProvocations = async () => {
    const dataFile = './app/provocations/data.json';

    const link = process.env.PROVOCATIONS_URL;
    if (!link) {
        const emptyData = {
            provocations: [],
        };
        await fs.promises.writeFile(dataFile, JSON.stringify(emptyData));
        console.log('Could not fetch provocations');
        return;
    }

    const response = await fetch(link);
    const json = await response.json();

    await fs.promises.writeFile(dataFile, JSON.stringify(json));
    console.log('Fetched provocations');
}



const main = async () => {
    await fetchProvocations();
}

main();
