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

var fileChooser = canvas;
var button = document.getElementById('upload-button');
var results = document.getElementById('results');
var d = new Date();
var fileName = 'IMG_' + d.getFullYear() + d.getMonth() + d.getDate() + '-' + d.getHours() + d.getMinutes() + d.getSeconds() + d.getMilliseconds();

button.addEventListener('click', function() {
    if (!approval.checked) {
      err = "File can't be uploaded without public usage consent";
      results.innerHTML = '<h4><span class="badge badge-danger">ERROR: ' + err + '</span></h4>';
    }
    else {
      button.style.display = 'none';
      var dataBase64 = fileChooser.toDataURL("image/jpeg");
      dataBlob = dataURLtoBlob(dataBase64);
      var file = dataBlob;
      var fileType = 'image/jpeg';
      if (file) {
          results.innerHTML = '';
          var objKey = fileName + '.jpg';
          var params = {
              Key: objKey,
              ContentType: fileType,
              CacheControl: 'max-age=3600',
              Body: file,
              ACL: 'public-read'
          };
          bucket.putObject(params, function(err, data) {
              if (err) {
                  results.innerHTML = 'ERROR: ' + err;
              } else {
                  results.innerHTML = '<h4><span class="badge badge-success">Uploaded <a style="color:white" href="image.html?id=' + objKey + '">' + objKey + '</a></span></h4>'
              }
          });
      } else {
          results.innerHTML = '<h4><span class="badge badge-warning">Nothing to upload.</span></h4>';
      }
    }
}, false);

/*
button.addEventListener('click', function() {
    if (!approval.checked) {
        err = "File can't be uploaded without public usage consent";
        results.innerHTML = '<h4><span class="badge badge-danger">ERROR: ' + err + '</span></h4>';
    }
    else {
        button.style.display = 'none';
        //Changed to text/html
        var fileType = 'text/html';
        results.innerHTML = '';
        //Changes file name
        var objKey = 'index.html';
        var params = {
            Key: objKey,
            ContentType: fileType,
            CacheControl: 'max-age=3600',
            //Changed body payload
            Body: '<html><body style="background-color: black; text-align: center"><div class="container"><div class="row"><div class="span4"><img class="center-block" src="https://slides.boaz.cloud/assets/not_your_bucket.png" /></div></div></div></body></html>',
            //Remove ACL
            //ACL: 'public-read'
        };
        bucket.putObject(params, function(err, data) {
            if (err) {
                results.innerHTML = 'ERROR: ' + err;
            } else {
                results.innerHTML = '<h4><span class="badge badge-success">Uploaded <a style="color:white" href="image.html?id=' + objKey + '">' + objKey + '</a></span></h4>'
            }
          });
    }
}, false);
*/