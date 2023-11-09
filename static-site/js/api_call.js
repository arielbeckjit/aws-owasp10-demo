function callAPI(myTag){
      $.ajax({
      type: "GET",
      url: apiURL + '/info/get_tags?tag=' + myTag,
      data: {
       format: 'json'
      },
      dataType: 'json',
      cache: false,
      success: function(data){
        //console.info(data);
        var objKeys = "";
        var rawKeys = [];
        data.forEach(function(obj) {
          //console.log(obj.photo_id);
          objKey = obj.photo_id;
          rawKeys.push(objKey);
          objKeys += "<div id='gallery_image' class='thumbnail'><a href='image.html?id=" + objKey + "'><img src='https://s3-eu-west-1.amazonaws.com/" + bucketName + "/" + objKey + "' id='" + objKey + "' class='rounded mx-auto d-block img-fluid mt-3' style='width:200px;'></a><div class='tags_list' id='tag_" + objKey + "'></div></div>";
        });
        gallery.innerHTML = objKeys;
        rawKeys.forEach(getTags);
      },
      error: function(data, textStatus, errorThrown){
        console.error(data);
        gallery.innerHTML = "<div class='row badge block-wrap badge-pill badge-danger m-5 p-3'><h4>Error: " + JSON.parse(data.responseText)["message"] + "</h4></div>";
      }
      });
    }

var urlParams = new URLSearchParams(window.location.search);
var my_tag = urlParams.get('tag');
var tag_p = document.getElementById('tag_id');

tag_p.textContent = my_tag

callAPI(my_tag);
