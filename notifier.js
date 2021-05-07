let nodemailer = require('nodemailer');

let nodemailerTransporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: String(process.env.EMAIL),
        pass: String(process.env.APPLICATION_PASSWORD)
    }
});


exports.sendEmail = function (email, subjectLine, slotDetails, callback) {
    let to = process.env.RECIPIENT_EMAIL;
    let options = {
        from: String('Vaccine Slot Checker ' + process.env.EMAIL),
        to: to,
        subject: subjectLine,
        text: 'Hi '+process.env.NAME+', \n\n Vaccine slot is available at below locations. Please find below details: \n\n' + slotDetails
    };
    nodemailerTransporter.sendMail(options, (error, info) => {
        if (error) {
            return callback(error);
        }
        callback(error, info);
    });
};
