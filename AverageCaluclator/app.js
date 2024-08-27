require('dotenv').config();

const express = require('express');
const axios = require('axios');

const app = express();

const windowSize = process.env.window_size;
const port = process.env.port

// api url's for test servers
const base_url = 'http://20.244.56.144/test';
const primes_url = `${base_url}/primes`;
const fibo_url = `${base_url}/fibo`;
const even_url = `${base_url}/even`;
const random_url = `${base_url}/rand`;

// fetch numbers from test servers
const fetchNumbers = async (quant) => {
    let url;
    switch(quant) {
        case 'p':
            url = primes_url;
            console.log(url);
            break;
        case 'f':
            url = fibo_url;
            break;
        case 'e':
            url = even_url;
            break;
        case 'r':
            url = random_url;
            break;
        default:
            return [];
    }

    try {
        const response = await axios.get(url, { 
            timeout : 500,
            headers: {
            Authorization: `Bearer ${process.env.access_token}`
            }
        });

        console.log(`Fetched numbers from ${url}`);

        return response.data.numbers;
    } 
    catch (error) {
        console.error(error);
        return [];
    }
}

// calculate average of numbers
const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    return numbers.reduce((acc, num) => acc + num, 0) / numbers.length;
}

// initialize window state
let windowState = new Set(); // to ensure the numbers sre unique

// app route
app.get('/numbers/:quant', async (req, res) => {
    const { quant } = req.params;

    console.log(`Fetching ${quant} numbers`);

    try{
        const newNumb = await fetchNumbers(quant);

        console.log(newNumb);

        const windowStatePrev = [...windowState];
        console.log(windowStatePrev)

        newNumb.forEach(num => windowState.add(num));

        console.log(windowState)
        console.log(windowState.size)

        while(windowState.size > windowSize) {
            const [firstElement, ...rest] = [...windowState]; // Spread the Set into an array
            console.log(firstElement);
            windowState = new Set(rest); // Recreate the Set without the first element
        }

        const response = {
            numbers : newNumb,
            windowPrevState : windowStatePrev,
            windowCurrState: [...windowState],
            avg: calculateAverage([...windowState]),
        }

        res.json(response);
    }
    catch(error) {
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {    
    console.log(`Server started at port ${port}`);
});