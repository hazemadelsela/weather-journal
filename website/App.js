const baseURL = 'api.openweathermap.org/data/2.5/weather?zip='; // append zip code + API Key
const apiKey = '&appid=f59894d9489fc7432311fd818f0dd28d';
const apiKeyName = 'Default';

// Create a new date instance dynamically with JS
let d = new Date();
let newDate = (d.getMonth() + 1) + '.' + d.getDate() + '.' + d.getFullYear();

//Get Current weather data from OpenWeatherMap.com API
const getWeather = async (baseURL, zipCode, apiKey) => {
    const response = await fetch(`https://${baseURL}${zipCode}${apiKey}`);

    try {
        const weatherData = await response.json();
        return weatherData;
    } catch (error) {
        console.log(error);
    }
};

//Post User data from the DOM to the local server API
const getUserData = async (url = '', data = {}) => {
    const response = await fetch(url,
        {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    try {
        const newUserData = await response.json();
        return newUserData;
    } catch (error) {
        console.log(error);
    }
};


//Initiate asynchrounus event on click
document.getElementById('generate').addEventListener('click', (event) => {
    event.preventDefault()

    //Disable Error messages visibilty from the UI
    document.getElementById('zip-code-error').style.display = 'none';
    document.getElementById('feelings-error').style.display = 'none';

    //Return Weather temperature asynchronously
    const weather = async () => {

        //Fetch User Content from the DOM and the OpenWeatherMap.com API
        let zipCode = document.getElementById('zip').value;
        let feelings = document.getElementById('feelings').value;

        //validate zip code and feelings
        const validate = async (zipCode, feelings) => {
            let zipCodePattern = /^\d{5}$|^\d{5}-\d{4}$/;
            let zipCodeTest = zipCodePattern.test(zipCode);

            //Generate zip code error message
            const zipCodeMessage = () => {
                const zipCodeError = document.getElementById('zip-code-error');
                zipCodeError.style.display = 'block';
                zipCodeError.style.color = 'red';
                zipCodeError.style.fontSize = '0.75em';
                zipCodeError.style.backgroundColor = '#fff';
                zipCodeError.innerHTML = 'Zipcode must be like 12345 or 12345-6789.';
            };

            //Generate feelings error message
            const feelingsMessage = () => {
                const feelingsError = document.getElementById('feelings-error');
                feelingsError.style.display = 'block';
                feelingsError.style.color = 'red';
                feelingsError.style.fontSize = '0.75em';
                feelingsError.style.backgroundColor = '#fff';
                feelingsError.innerHTML = 'You should type how are you feeling.';
            };

            //Validation conditions
            if (zipCodeTest == false && feelings == '') {
                zipCodeMessage();
                feelingsMessage();
                return;
            } else if (zipCodeTest == false) {
                zipCodeMessage();
                return;
            } else if (feelings == '') {
                feelingsMessage();
                return;
            }

            //Initiate Get Current weather temperature
            const weatherAsync = await getWeather(baseURL, zipCode, apiKey);
            let temperature = weatherAsync.main.temp;

            //Construct Project Data in the local server
            let userData = {
                'zip-code': zipCode,
                'feelings': feelings,
                'temp': temperature,
                'date': newDate
            };

            //Initaite updating user content in the UI
            await userContent(userData);

            //Update temperature in the UI
            document.getElementById('temp').innerHTML = `Temperature: ${temperature} °C`;
            return userData;
        }

        //Initiate validation
        await validate(zipCode, feelings);
    };

    //Return User Content asynchronously to the local server
    const userContent = async (userData) => {
        const userAsyncContent = await getUserData('/api', userData);
        const lastZipCode = userAsyncContent['zip-code'];
        const lastFeelings = userAsyncContent['feelings'];

        //Update Date, zipCode and Feelings in the UI
        document.getElementById('date').innerHTML = `Date: ${newDate}`;
        document.getElementById('content').innerHTML = `Zipcode: ${lastZipCode}<br>Feelings: ${lastFeelings}`;
        return userAsyncContent;
    };

    //Initiate acynchromnus functions weather() and userContent() on click
    weather();
});