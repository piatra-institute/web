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



const main = async () => {
    await fetchData(
        'papers',
        './app/papers/data.json',
        process.env.PAPERS_URL,
    );

    await fetchData(
        'provocations',
        './app/provocations/data.json',
        process.env.PROVOCATIONS_URL,
    );
}

main();
