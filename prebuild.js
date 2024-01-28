const fs = require('fs');



const fetchDiscussions = async () => {
    const dataFile = './app/discussions/data.json';

    const link = process.env.DISCUSSIONS_URL;
    if (!link) {
        const emptyData = {
            discussions: [],
        };
        await fs.promises.writeFile(dataFile, JSON.stringify(emptyData));
        console.log('Could not fetch discussions');
        return;
    }

    const response = await fetch(link);
    const json = await response.json();

    await fs.promises.writeFile(dataFile, JSON.stringify(json));
    console.log('Fetched discussions');
}



const main = async () => {
    await fetchDiscussions();
}

main();
