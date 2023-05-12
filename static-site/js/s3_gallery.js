AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: AWSPoolID
});

accessKeyId = AWS.config.credentials.accessKeyId
secretAccessKey = AWS.config.credentials.secretAccessKey

var bucketName = 'owasp10-demo';
var bucket = new AWS.S3({
    params: {
        Bucket: bucketName
    }
});

var ddbTableTags = 'owasp10-demo-PhotosTags';
var ddb = new AWS.DynamoDB.DocumentClient();

function listObjs() {
    var prefix = 'IMG';
    var rawKeys = [];
    bucket.listObjects({
        Prefix: prefix,
        EncodingType: "url",
    }, function(err, data) {
        if (err) {
            gallery.innerHTML = 'ERROR LIST: ' + err;
        } else {
            var objKeys = "";
            data.Contents.forEach(function(obj) {
                objKey = obj.Key;
                rawKeys.push(objKey);
                objKeys += "<div id='gallery_image' class='thumbnail'><a href='image.html?id=" + objKey + "'><img src='https://s3-eu-west-1.amazonaws.com/" + bucketName + "/" + objKey + "' id='" + objKey + "' class='rounded mx-auto d-block img-fluid p-2'></a><div class='tags_list' id='tag_" + objKey + "'></div></div>";
            });
            gallery.innerHTML = objKeys;
            rawKeys.forEach(getTags);
        }
    });
}

function getTags(key){
  var tags = "";
  var params = {
    TableName: ddbTableTags,
    IndexName: "IdOnly",
    KeyConditionExpression: 'photo_id = :pid',
    ExpressionAttributeValues: { ':pid': key},
  };
  ddb.query(params, function(err, data) {
    if (err) {
      console.log("Error QUERY", err);
    } else {
      //console.log("Success", data);
      data.Items.forEach(function(element, index, array) {
        if (tags) tags += ", ";
        tags += "<a href='tag.html?tag=" + (element.tag_id) + "'>" + (element.tag_id) + "</a>";
      });
    }
    if (tags == "") {
      tags = "NO TAGS";
    }

    var tag_p = document.getElementById('tag_' + key);
    tag_p.innerHTML = tags;

  });
}
