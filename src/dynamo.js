const aws = require('aws-sdk');
const {v4: uuidv4} = require('uuid');

const docClient = new aws.DynamoDB.DocumentClient();
aws.config.update({
    region: 'us-east-2'
});
const dynamodb = new aws.DynamoDB();

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

const saveEmail = async function (req, res) {
    const {mail, status, userName, message} = req.body;
    let generateUnknownShopperId = () => uuidv4().replace(/-/g, '').toUpperCase();
    let uuid = generateUnknownShopperId();
    const params = {
        TableName: 'SaveReceipts2',
        Item: {
            id: 124,
            status: status,
            ticketId: uuid,
            name: userName,
            mail: mail,
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
