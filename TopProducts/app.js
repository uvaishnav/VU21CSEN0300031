require('dotenv').config();

const express = require('express');
const axios = require('axios'); 
const { v4: uuidv4 } = require('uuid');
const app = express();

const cache = {}

const port = process.env.port;

const base_url = 'http://20.244.56.144/test/companies';

// to fetch productsfrom single company
const fetchProducts = async (companyName, categoryName, params) => {
    try{
        const response = await axios.get(`${base_url}/${companyName}/categories/${categoryName}/products`, {
            timeout: 5000,
            headers: {
                Authorization: `Bearer ${process.env.access_token}`
            },
            params: params
        });

        const product_data = response.data;

        return product_data.map((product)=>({
            ...product,
            id: uuidv4(),  // adding unique id to the product object
            company : companyName,  // adding company name to the product object
        }))
    }
    catch(error){
        console.error(error);
        return [];
    }
};

const companies = ['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];

// to get top n producs with in a category
app.get('/categories/:categoryName/products', async (req, res) => {
    const {categoryName} = req.params;
    
    let { n = 10, minPrice, maxPrice, sort = '', sortBy = '', page = 1 } = req.query;

    n = parseInt(n);
    page = parseInt(page);

    // generate cache key based on req parameters
    const cacheKey = `${categoryName}-${n}-${minPrice}-${maxPrice}`;

    // check if the data is already in cache
    if(cache[cacheKey] && cache[cashKey].expiresAt > Date.now()){
        console.log('Serving from cache');
        return res.json(cache[cacheKey].data);
    }

    try{
        const promises = companies.map((company) => fetchProducts(company, categoryName, {top: n, minPrice, maxPrice,}));
        const results = await Promise.all(promises);

        if (sort && sortBy) {
            results.forEach((result) => {
                result.sort((a, b) => {
                    if (sort === 'asc') {
                        return a[sortBy] - b[sortBy];
                    } else {
                        return b[sortBy] - a[sortBy];
                    }
                });
            });
        }

        // page implementation
        const start = (page - 1) * n;
        const end = start + n;
        const products = results.flat().slice(start, end);

        const response = {
            products,
            currentPage : page,
            totalPages: Math.ceil(results.flat().length / n),
            totalProducts: results.flat().length,
        };

        // cache the data
        cache[cacheKey] = {
            data: response,
            expiresAt: Date.now() + 60000, // 1 minute
        };

        res.json(response);

    }
    catch(error){
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


app.listen(port, () => {
    console.log(`Server is running on prot ${port}`);
});