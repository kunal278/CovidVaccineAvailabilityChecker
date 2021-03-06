require('dotenv').config()
const moment = require('moment');
const cron = require('node-cron');
const axios = require('axios');
const notifier = require('./notifier');
/**
Step 1) Enable application access on your gmail with steps given here:
 https://support.google.com/accounts/answer/185833?p=InvalidSecondFactor&visit_id=637554658548216477-2576856839&rd=1

Step 2) Enter the details in the file .env, present in the same folder

Step 3) On your terminal run: npm i && pm2 start vaccineNotifier.js

To close the app, run: pm2 stop vaccineNotifier.js
 */

const DISTRICT_CODE = process.env.DISTRICT_CODE
const EMAIL = process.env.EMAIL
const AGE = process.env.AGE
const DOSE = process.env.CHECK_FOR_DOSE_1_OR_2

async function main(){
    try {
        cron.schedule('20 * * * * * *', async () => {
             await checkAvailability();
        });
    } catch (e) {
        console.log('an error occured: ' + JSON.stringify(e, null, 2));
        throw e;
    }
}

async function checkAvailability() {
    let districtId = DISTRICT_CODE;
    let datesArray = await fetchNext5Days();

        datesArray.forEach(date => {
            getSlotsForDate(date,districtId);
        })

}


function getSlotsForDate(DATE, districtId) {
    let config = {
        method: 'get',
        url: 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=' + districtId + '&date=' + DATE,
        headers: {
            'accept': 'application/json',
            'Accept-Language': 'hi_IN'
        }
    };
    console.log('CONFIG URL ::: ',config);
    axios(config)
        .then(function (slots) {
            console.log('slot ::: ',slots.data.sessions);
            let sessions = slots.data.sessions;
            let validSlots;
            if(DOSE == 1){
                validSlots = sessions.filter(slot => slot.min_age_limit <= AGE &&  slot.available_capacity_dose1 > 0)
            }
            else{
                validSlots = sessions.filter(slot => slot.min_age_limit <= AGE &&  slot.available_capacity_dose2 > 0 )
            }
            console.log({date:DATE, validSlots: validSlots.length})
            if(validSlots.length > 0) {
                notifyMe(validSlots);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function

notifyMe(validSlots){
    let slotDetails = JSON.stringify(validSlots, null, '\t');
    notifier.sendEmail(EMAIL, 'VACCINE AVAILABLE', slotDetails, (err, result) => {
        if(err) {
            console.error({err});
        }
    })
};

async function fetchNext5Days(){
    let dates = [];
    let today = moment();
    for(let i = 0 ; i < 5 ; i ++ ){
        let dateString = today.format('DD-MM-YYYY')
        dates.push(dateString);
        today.add(1, 'day');
    }
    return dates;
}


main()
    .then(() => {console.log('Vaccine slot availability checker started.');});
