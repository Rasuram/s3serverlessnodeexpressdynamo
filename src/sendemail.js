const aws = require('aws-sdk');
aws.config.update({
    region: 'us-east-2'
});

const ses = new aws.SES();
const sendMail = async function (req, res) {
    console.log(req.body);
    const {email, subject, message} = req.body;
    let destination = {
        "ToAddresses": [email]
    };
    let templateData = {};
    templateData.link = `https://master.dlyq604hg02bi.amplifyapp.com/reply?email=${email}`
    templateData.subject = subject;
    templateData.message = message;

    let params1 = {
        Template: {
            TemplateName: 'TestTemplate18',
            HtmlPart: "<div><p><textarea style=\"color:coral;\" className={`textarea resize-ta`}>{{message}}</textarea></p>" +
                "<a href={{link}}>reply me</a></div>",
            SubjectPart: "{{subject}}",
            TextPart: 'Dear ,\r\nthanks for contacting.'
        }
    };
    await ses.createTemplate(params1, function (err, data) {
    });

    let params = {};
    params.Source = email;
    params.Destination = destination;
    params.Template = "TestTemplate18";
    params.TemplateData = JSON.stringify(templateData);


    ses.sendTemplatedEmail(params, function (email_err, email_data) {
        if (email_err) {
            console.error("Failed to send the email : " + email_err);
            res.status(500).send({
                statusCode: 500,
                body: JSON.stringify(email_err),
            });
        } else {
            console.info("Successfully sent the email : " + JSON.stringify(email_data));
            res.status(200).send({
                statusCode: 200,
                body: JSON.stringify(email_data),
            });
        }
    })
}

module.exports = {
    sendMail
};

