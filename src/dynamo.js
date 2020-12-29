const aws = require('aws-sdk');
const {v4: uuidv4} = require('uuid');
const docClient = new aws.DynamoDB.DocumentClient();
aws.config.update({
    region: 'us-east-2'
});
const dynamodb = new aws.DynamoDB();
const ses = new aws.SES();
const params = {
    TableName: "SaveReceipts2",//save ticket
    KeySchema: [
        {AttributeName: "id", KeyType: "HASH"},  //Partition key
    ],
    AttributeDefinitions: [
        {AttributeName: "id", AttributeType: "N"},
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
};


dynamodb.createTable(params, function (err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});

const sendMail = async function (req) {
    const {replyEmail, subject, message} = req.body;
    console.log("send reply email for: ", replyEmail, subject, message);
    let params = {};
    let templateData = {};
    templateData.subject = `Re:${subject}`;
    templateData.message = message;
    let destination = {
        "ToAddresses": [replyEmail]
    };
    params.Source = replyEmail;
    templateData.link = `https://master.dlyq604hg02bi.amplifyapp.com/reply?email=${replyEmail}`
    params.Destination = destination;
    params.Template = "TestTemplate14";
    params.TemplateData = JSON.stringify(templateData);


    ses.sendTemplatedEmail(params, function (email_err, email_data) {
        if (email_err) {
            console.error("Failed to send reply email : " + email_err);
        } else {
            console.info("Successfully sent reply email : " + JSON.stringify(email_data));
        }
    })
}


const saveEmail = async function (req, res) {
    const {replyEmail, status, userName, message} = req.body;
    let generateUnknownShopperId = () => uuidv4().replace(/-/g, '').toUpperCase();
    let uuid = generateUnknownShopperId();
    await sendMail(req);
    const params = {
        TableName: 'SaveReceipts2',
        Item: {
            id: 124,
            status: status,
            ticketId: uuid,
            name: userName,
            mail: replyEmail,
            message: message
        }
    };
    docClient.put(params, function (err, data) {
        if (err) {
            res.send({
                success: false,
                message: 'Error: Server error',
                ticketId: uuid,
            });
            console.log(err);
        } else {
            console.log('data', data);
            const {Items} = data;
            res.send({
                success: true,
                message: 'receipt saved successfully',
                ticketId: uuid,
                Items: Items
            });
        }
    });
}

const getAllDetails = async function (req, res) {
    const ticketId = req.params.id;
    const params = {
        TableName: 'SaveReceipts2',
        KeyConditionExpression: 'id = :i',
        ExpressionAttributeValues: {
            ':i': 124
        }
    };
    docClient.query(params, function (err, data) {
        if (err) {
            console.log(err);
            res.send({
                success: false,
                message: 'Error: Server error'
            });
        } else {
            console.log('data', data);
            const {Items} = data;
            res.send({
                success: true,
                message: 'loaded all customer statuses',
                users: Items
            });
        }
    });
};


module.exports = {
    saveEmail,
    getAllDetails
};
