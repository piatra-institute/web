const fs = require('fs');



const fetchInterviews = async () => {
    const link = process.env.INTERVIEWS_URL;
    if (!link) {
        return;
    }

    const dataFile = './app/interviews/data.json';
    const response = await fetch(link);
    const json = await response.json();

    await fs.promises.writeFile(dataFile, JSON.stringify(json));
}



const main = async () => {
    await fetchInterviews();
}

main();
