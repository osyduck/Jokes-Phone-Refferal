const fetch = require('node-fetch');
const inquirer = require('inquirer');
const colors = require("./lib/colors");
const moment = require('moment');

const request = ({ endpoint, data }) => new Promise((resolve, reject) => {
    let header = {
        'Connection': 'keep-alive',
        'Host': 'master.appha.es',
        'Content-Type': 'application/json; charset=UTF-8'
    }

    let fetchData = {
        headers: header
    }

    if (data) {
        fetchData.method = "POST";
        fetchData.body = data;
    } else {
        fetchData.method = "GET";
    }

    fetch(endpoint, fetchData)
        .then(res => res.json())
        .then(text => {
            resolve(text);
        })
        .catch(err => reject(err));
});

const randstr = length => {
    var text = "";
    var possible =
        "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz1234567890";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

const getReffCode = (reffLink) => new Promise((resolve, reject) => {
    fetch(reffLink, {
        method: 'GET',
        redirect: 'nofollow',
        headers: {
            "Host": "myjokesphone.page.link",
            "user-agent": "Mozilla/5.0 (Linux; Android 10; SM-G988B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.186 Mobile Safari/537.36",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
            "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
        }
    })
        .then(res => {
            let location = res.headers.get('location');
            let reffcode = location.split("http://new_")[1].split(";")[0];
            resolve(reffcode)
        })
        .catch(err => {
            reject(err)
        })
});

; (async () => {

    let question = await inquirer
        .prompt([
            {
                type: 'input',
                name: 'reff',
                message: 'Input ReffLink : ',
            },
            {
                type: 'input',
                name: 'number',
                message: 'Input Number of Reff  : ',
            }
        ])
        .then(async (answers) => {
            return answers;
        });


    let reff = question.reff;
    let successNum = 0;

    for (let i = 0; i < question.number; i++) {
        let aid = randstr(16);
        let reffCode = await getReffCode(reff);
        let create = await request({ endpoint: "https://master.appha.es/lua/jokesphone/user/create.lua", data: `{"uv":"jokesphone","dtype":"adr","did":"${aid}@jokesphone","route":"jo_1","tags":{"mf":"Samsung","mcc":510,"mnc":1,"r":"10","v":"2.3.060522.212","l":"in_ID","c":"ID","platform":"gplay","aid":"${aid}","class":"Jokesphone_o"},"root":false,"imeiex":false,"version":"2.3.060522.212","version_num":212,"recommender":"${reffCode}"}` })
        if (create.res == "OK") {
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, colors.FgGreen,
                `Refferal ${i + 1} => Success!`,
                colors.Reset);
            successNum++;
        } else {
            let errorRes = JSON.parse(create.content.et);
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, colors.FgRed,
                `Refferal ${i + 1} => Error: ${errorRes.et}`,
                colors.Reset);
        };
    };

    console.log(`[ ${moment().format("HH:mm:ss")} ] `, colors.FgYellow,
                `Added ${successNum} Credit to Your Account!`,
                colors.Reset);

})()