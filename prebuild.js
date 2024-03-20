const fs = require('fs');



const fetchData = async (
    type,
    dataFile,
    link,
) => {
    if (!link) {
        const emptyData = {
            [type]: [],
        };
        await fs.promises.writeFile(dataFile, JSON.stringify(emptyData));
        console.log(`Could not fetch ${type}`);
        return;
    }

    const response = await fetch(link);
    const json = await response.json();

    await fs.promises.writeFile(
        dataFile,
        JSON.stringify(json, null, 4),
    );
    console.log(`Fetched ${type}`);
}


const dataFiles = [
    {
        type: 'provocations',
        dataFile: './app/provocations/data.json',
        link: process.env.PROVOCATIONS_URL,
    },
    {
        type: 'papers',
        dataFile: './app/papers/data.json',
        link: process.env.PAPERS_URL,
    },
    {
        type: 'press',
        dataFile: './app/press/data.json',
        link: process.env.PRESS_URL,
    },
];



const main = async () => {
    for (const { type, dataFile, link } of dataFiles) {
        await fetchData(type, dataFile, link);
    }
}

main();
