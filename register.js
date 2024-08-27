require('dotenv').config();
const axios = require('axios');


// Registration

const regester_url = process.env.register_link;

const getRegistered = async(regester_body) =>{
    try {
        const response = await axios.post(regester_url, regester_body);
        const register_data = response.data;
        const client_id = register_data.clientID;
        const client_secret = register_data.clientSecret;
        console.log("Registration Data");
        console.log(register_data);

        return {client_id, client_secret};
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

// Authentication


const getAuth = async (auth_body) => {
    try {
        const response = await axios.post(process.env.auth_link, auth_body);
        const auth_data = response.data;
        const access_token = auth_data.access_token;
        console.log("Authentication Data");
        console.log(response.data);

        return access_token;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

const main = async() => {

    regester_body = {
        "companyName" : process.env.company_name,
        "ownerName" : process.env.owner_name,
        "rollNo" : process.env.roll_number,
        "ownerEmail" : process.env.owner_email,
        "accessCode" : process.env.access_code,
    }

    const {client_id, client_secret} = await getRegistered(regester_body);

    auth_body = {
        "companyName" : process.env.company_name,
        "clientID" : client_id,
        "clientSecret" : client_secret,
        "ownerName" : process.env.owner_name,
        "ownerEmail" : process.env.owner_email,
        "rollNo" : process.env.roll_number,
    }

    const access_token = await getAuth(auth_body);
}

main();