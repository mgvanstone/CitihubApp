'use strict';
var hostweburl;
var appweburl;
// Load the required SharePoint libraries.
$(document).ready(function () {
    //Get the URI decoded URLs.
    hostweburl = decodeURIComponent(
getQueryStringParameter("SPHostUrl"));
    appweburl = decodeURIComponent(
getQueryStringParameter("SPAppWebUrl"));
    // Resources are in URLs in the form:
    // web_url/_layouts/15/resource
    var scriptbase = hostweburl + "/_layouts/15/";
    // Load the js file and continue to load the page with information about the list items.
    // SP.RequestExecutor.js to make cross-domain requests

    $.getScript(scriptbase + "SP.RequestExecutor.js", loadPage);
});
// Utilities
// Retrieve a query string value.
// For production purposes you may want to use a library to handle the query string.
function getQueryStringParameter(paramToRetrieve) {
    var params = document.URL.split("?")[1].split("&");
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve) return singleParam[1];
    }
}
function loadPage() {
   getListItems();
}
//Retrieve all of the list items
function getListItems() {
    var executor;
    // Initialize the RequestExecutor with the app web URL.
    executor = new SP.RequestExecutor(appweburl);
    executor.executeAsync({
        url: appweburl + "/_api/SP.AppContextSite(@target)/web/lists/getbytitle('Projects')/items?@target='" + hostweburl + "'",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        },
        success: getListItemsSuccessHandler,
        error: getListItemsErrorHandler
    });
}
//Populate the selectListItems control after retrieving all of the list items.
function getListItemsSuccessHandler(data) {
    var jsonObject = JSON.parse(data.body);
    var selectListItems = document.getElementById("selectListItems");
    if (selectListItems.hasChildNodes()) {
        while (selectListItems.childNodes.length >= 1) {
            selectListItems.removeChild(selectListItems.firstChild);
        }
    }
    var results = jsonObject.d.results;
    for (var i = 0; i < results.length; i++) {
        var selectOption = document.createElement("option");
        selectOption.value = results[i].Title;
        selectOption.innerText = results[i].Title;
        selectListItems.appendChild(selectOption);
    }
}
function getListItemsErrorHandler(data, errorCode, errorMessage) {
    alert("Could not get list items: " + errorMessage);
}

function addProject() {
    var projName = jQuery('#projectName').val();
    //alert("project " + projName);
    addListItem("Projects", projName);
    location.reload();
    addFolderToDirectory(projName);

    
}

function addFolder() {
    var folderName = jQuery('#folderName').val();

    addFolderToDirectory(folderName);
}

// Adding a list item with the metadata provided
function addListItem(listname, projName) {

    // Prepping our update
    //   var item = $.extend({
    //       "__metadata": { "type": "SP.Data.ProjectsListItem" }
    //   }, { 'Title': projName });

    //Metadata to update.
    var item = {
        "__metadata": { "type": "SP.Data.ProjectsListItem" },
        "Title": projName
    };

    var requestBody = JSON.stringify(item);
    var requestHeaders = {
        "accept": "application/json;odata=verbose",
        "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
        "X-HTTP-Method": "POST",
        "content-length": requestBody.length,
        "content-type": "application/json;odata=verbose",
        "If-Match": "*"
    };

    var executor;
    // Initialize the RequestExecutor with the app web URL.
    executor = new SP.RequestExecutor(appweburl);
    executor.executeAsync({
        url: appweburl + "/_api/SP.AppContextSite(@target)/web/lists/getbytitle('Projects')/items?@target='" + hostweburl + "'",
        method: "POST",
        contentType: "application/json;odata=verbose",
        headers: requestHeaders,
        body: JSON.stringify(item),
        success: function (data) {
            alert('OK');
        },
        error: function (data) {
           // alert('FAILED');
        }
    });
}

function addListItems() {
    var executor;
    // Initialize the RequestExecutor with the app web URL.
    executor = new SP.RequestExecutor(appweburl);
    executor.executeAsync({
        url: appweburl + "/_api/SP.AppContextSite(@target)/web/lists/getbytitle('Projects')/items?@target='" + hostweburl + "'",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        },
        success: getListItemsSuccessHandler,
        error: getListItemsErrorHandler
    });
}

// Upload the file.
// You can upload files up to 2 GB with the REST API.
function uploadFile() {

    // Define the folder path for this example.
    var serverRelativeUrlToFolder = '/shared documents';

    // Get test values from the file input and text input page controls.
    // The display name must be unique every time you run the example.
    var fileInput = jQuery('#getFile');
    var newName = jQuery('#displayName').val();

    // Initiate method calls using jQuery promises.
    // Get the local file as an array buffer.
    var getFile = getFileBuffer();
    getFile.done(function (arrayBuffer) {

        // Add the file to the SharePoint folder.
        var addFile = addFileToFolder(arrayBuffer);
        addFile.done(function (file, status, xhr) {

            alert("got here1");
            // Get the list item that corresponds to the uploaded file.
            var getItem = getListItem(file.d.ListItemAllFields.__deferred.uri);
            getItem.done(function (listItem, status, xhr) {

                // Change the display name and title of the list item.
                var changeItem = updateListItem(listItem.d.__metadata);
                changeItem.done(function (data, status, xhr) {
                    alert('file uploaded and updated');
                });
                changeItem.fail(onError);
            });
            getItem.fail(onError);
        });
        addFile.fail(onError);
    });
    getFile.fail(onError);

    // Get the local file as an array buffer.
    function getFileBuffer() {
        var deferred = jQuery.Deferred();
        var reader = new FileReader();
        reader.onloadend = function (e) {
            deferred.resolve(e.target.result);
        }
        reader.onerror = function (e) {
            deferred.reject(e.target.error);
        }
        reader.readAsArrayBuffer(fileInput[0].files[0]);
        return deferred.promise();
    }

    // Add the file to the file collection in the Shared Documents folder.
    function addFileToFolder(arrayBuffer) {

        // Get the file name from the file input control on the page.
        var parts = fileInput[0].value.split('\\');
        var fileName = parts[parts.length - 1];

        alert("got here");
        // Construct the endpoint.
        var fileCollectionEndpoint = String.format(
            "{0}/_api/sp.appcontextsite(@target)/web/getfolderbyserverrelativeurl('{1}')/files" +
            "/add(overwrite=true, url='{2}')?@target='{3}'",
            appweburl, serverRelativeUrlToFolder, fileName, hostweburl);

        alert("got here");
        // Send the request and return the response.
        // This call returns the SharePoint file.
        return jQuery.ajax({
            url: fileCollectionEndpoint,
            type: "POST",
            data: arrayBuffer,
            processData: false,
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "content-length": arrayBuffer.byteLength
            }
        });
    }

    // Get the list item that corresponds to the file by calling the file's ListItemAllFields property.
    function getListItem(fileListItemUri) {

        // Construct the endpoint.
        // The list item URI uses the host web, but the cross-domain call is sent to the
        // app web and specifies the host web as the context site.
        fileListItemUri = fileListItemUri.replace(hostweburl, '{0}');
        fileListItemUri = fileListItemUri.replace('_api/Web', '_api/sp.appcontextsite(@target)/web');

        var listItemAllFieldsEndpoint = String.format(fileListItemUri + "?@target='{1}'",
            appweburl, hostweburl);

        // Send the request and return the response.
        return jQuery.ajax({
            url: listItemAllFieldsEndpoint,
            type: "GET",
            headers: { "accept": "application/json;odata=verbose" }
        });
    }

    // Change the display name and title of the list item.
    function updateListItem(itemMetadata) {

        // Construct the endpoint.
        // Specify the host web as the context site.
        var listItemUri = itemMetadata.uri.replace('_api/Web', '_api/sp.appcontextsite(@target)/web');
        var listItemEndpoint = String.format(listItemUri + "?@target='{0}'", hostweburl);

        // Define the list item changes. Use the FileLeafRef property to change the display name. 
        // For simplicity, also use the name as the title.
        // The example gets the list item type from the item's metadata, but you can also get it from the
        // ListItemEntityTypeFullName property of the list.
        var body = String.format("{{'__metadata':{{'type':'{0}'}},'FileLeafRef':'{1}','Title':'{2}'}}",
            itemMetadata.type, newName, newName);

        // Send the request and return the promise.
        // This call does not return response content from the server.
        return jQuery.ajax({
            url: listItemEndpoint,
            type: "POST",
            data: body,
            headers: {
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "content-type": "application/json;odata=verbose",
                "content-length": body.length,
                "IF-MATCH": itemMetadata.etag,
                "X-HTTP-Method": "MERGE"
            }
        });
    }
}

// Display error messages. 
function onError(error) {
    alert(error.responseText);
}

function XXuuu() {
    var fileInput = jQuery('#getFile');
    var newName = jQuery('#displayName').val();

    //var reader = new FileReader();

    //reader.onload = function (e) {
    //    var content = reader.result;
   //     var content = _arrayBufferToBase64(arrayBuffer);
    //    XXuploadfile(newName, content);
    //    alert("Complete");
    //}

    //reader.readAsArrayBuffer(fileInput);

    var reader = new FileReader();
    reader.onload = function (result) {
        var fileData = '';
        var byteArray = new Uint8Array(result.target.result)
        for (var i = 0; i < byteArray.byteLength; i++) {
            fileData += String.fromCharCode(byteArray[i])
        }
        XXuploadfile(newName, fileData);
    };
   // alert(fileInput);
    reader.readAsArrayBuffer(fileInput[0].files[0]);
}

function _arrayBufferToBase64(buffer) {
    var binary = ''
    var bytes = new Uint8Array(buffer)
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return binary;
}

function XXuploadfile(name, content) {
    alert("Here");
    var createitem = new SP.RequestExecutor(appweburl);
    createitem.executeAsync({
       // url: appweburl + "/_api/SP.AppContextSite(@target)/web/lists/getbytitle('Projects')/items?@target='" + hostweburl + "'",
        url: appweburl + "/_api/SP.AppContextSite(@target)/web/GetFolderByServerRelativeUrl('/sites/CitihubDev/Shared Documents')/Files/Add(url='" + name + "',overwrite=true)?@target='" + hostweburl + "'",
        method: "POST",
        headers: {
            "Accept": "application/json; odata=verbose",
            "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
        },
        contentType: "application/json;odata=verbose",
        binaryStringRequestBody: true,
        body: content,
        success: function (e) {            
            alert('done');
        },
        error: function () { alert("Error"); },
            state: "Update"
    });
}


// Get parameters from the query string.
// For production purposes you may want to use a library to handle the query string.
//function getQueryStringParameter(paramToRetrieve) {
//    var params = document.URL.split("?")[1].split("&");
//    for (var i = 0; i < params.length; i = i + 1) {
//        var singleParam = params[i].split("=");
//        if (singleParam[0] == paramToRetrieve) return singleParam[1];
//    }
//}

function getListItemsXXXX() {
    var executor;
    // Initialize the RequestExecutor with the app web URL.
    executor = new SP.RequestExecutor(appweburl);
    executor.executeAsync({
        url: appweburl + "/_api/SP.AppContextSite(@target)/web/lists/getbytitle('Projects')/items?@target='" + hostweburl + "'",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        },
        success: getListItemsSuccessHandler,
        error: getListItemsErrorHandler
    });
}

function addFile2() {

      var executor = new SP.RequestExecutor(appweburl);
//    executor.executeAsync({
//        url: appweburl + "/_api/SP.AppContextSite(@target)/web/getfilebyserverrelativeurl('/sites/CitihubDev/Shared Documents/Document.docx')?@target='" + hostweburl + "'",
//        method: "GET",
//    headers: { "accept": "application/json; odata=verbose" },
//    success: function (data) {
//        alert("success: " + JSON.stringify(data));
//    },
//    error: function (err) {
//        alert("error: " + JSON.stringify(err));
//    }
//    });

    
    executor.executeAsync({
       url: appweburl + "/_api/SP.AppContextSite(@target)/web/getfilebyserverrelativeurl('/sites/CitihubDev/Shared Documents/filename.txt')/$value?@target='" + hostweburl + "'",
       method: "POST",
    body: "Updated contents of the file go here2",
    headers: { "X-HTTP-Method":"PUT" },
    success: function (data) {
        alert("success: " + JSON.stringify(data));
    },
    error: function (err) {
        alert("error: " + JSON.stringify(err));
    }
    });
}

function addFolderToDirectory(folder) {
    // executor: The RequestExecutor object  
    // Initialize the RequestExecutor with the app web URL.  
    var executor = new SP.RequestExecutor(appweburl);     
   // alert("here");
    executor.executeAsync({
        url: appweburl + "/_api/SP.AppContextSite(@target)/web/folders/add('/sites/CitihubDev/Shared Documents/" + folder + "')?@target='" + hostweburl + "'",
        method: "POST",
    headers: { "accept": "application/json; odata=verbose" },
    success: function (data) {
        alert("success: " + JSON.stringify(data));
    },
    error: function (err) {
       // alert("error: " + JSON.stringify(err));
    }
});                            
}

function getFileBuffer() {
    var deferred = jQuery.Deferred();
    var reader = new FileReader();
    reader.onloadend = function (e) {
        deferred.resolve(e.target.result);
    }
    reader.onerror = function (e) {
        deferred.reject(e.target.error);
    }
    reader.readAsArrayBuffer(fileInput[0].files[0]);
    return deferred.promise();
}