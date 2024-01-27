const fs = require('fs');



const fetchInterviews = async () => {
    const dataFile = './app/discussions/data.json';

    const link = process.env.DISCUSSIONS_URL;
    if (!link) {
        const emptyData = {
            discussions: [],
        };
        await fs.promises.writeFile(dataFile, JSON.stringify(emptyData));
        return;
    }

    const response = await fetch(link);
    const json = await response.json();

    await fs.promises.writeFile(dataFile, JSON.stringify(json));
}



const main = async () => {
    await fetchInterviews();
}

main();
