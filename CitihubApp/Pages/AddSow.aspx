<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <script type="text/javascript" src="/_layouts/15/SP.UI.Dialog.js"></script> 
    <meta name="WebPartPageExpansion" content="full" />

    <!-- Add your CSS styles to the following file -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css" />

    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap-theme.min.css" />

    <!-- Latest compiled and minified JavaScript -->
    <script type="text/css" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>

    <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="../Scripts/App.js"></script>
    <script  type="text/javascript">
        function addSoW() {
            console.log("addSoW");
            var projName = jQuery('#projectName').val();
            var projId = jQuery('#selectListItems  option:selected').val();
            var clientId = jQuery('#selectClientListItems option:selected').val();
            var status = jQuery('#selectStatus option:selected').text();

            var fileInput = jQuery('#inputFile');
            var fileName = fileInput.val();
            var newName = fileName.substr(fileName.lastIndexOf("\\") + 1);

            uploadDoc(fileInput, newName);

            var documentLink = "https://citihub.sharepoint.com/sites/CitihubDev/Shared%20Documents/" + newName;

           // var documentLink = document.getElementById("downloadLink").href;
            addNewSoW(projName, clientId, documentLink, status, projId);
        }

        // Clear the form
        function cancelSoW() {
            console.log("cancelSoW");
            
            $("#projectName").val("");
            $("#inputFile").val("");
            $("#documentLink").val("");

            jQuery("#selectClientListItems").find("option:contains('None Selected')").each(function () {
                if (jQuery(this).text() == 'None Selected') {
                    jQuery(this).attr("selected", "selected");
                }
            });

            $('#selectListItems').empty();

            jQuery("#selectStatus").find("option:contains('None Selected')").each(function () {
                if (jQuery(this).text() == 'None Selected') {
                    jQuery(this).attr("selected", "selected");
                }
            });
        }

        function addProject4() {
            console.log("addProject start");
            //var projName = jQuery('#projectName').val();
            //addProject(projName);
        }

        $('#downloadLink').hide();

</script>
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
  <!--  <WebPartPages:WebPartZone runat="server" FrameType="TitleBarOnly" ID="full" Title="loc:full" /> -->
<div class="container">
    <br />
    <div class="panel panel-primary">
        
        <!-- Default panel contents -->
        <div class="panel-heading">Add SoW</div>
        <br />
        <form class="form-horizontal" role="form">            
            <div class="form-group">
                <label class="control-label col-md-3">Title:</label>
                <div class="input-group col-md-7">
                    <input class="form-control" id="projectName" type="text" />
                </div>
            </div>
            <div class="form-group">
                <label class="control-label col-md-3">Select a Client:</label>
                <div class="input-group col-md-7">
                    <select class="form-control" style="width: 150px; " id="selectClientListItems" onchange="readProjectsForClient()"></select>
                    <input id="addClient" class="btn btn-default" type="button" value="Add Client" onclick="OpenClientDialog()" />
                </div>
            </div>
            <div class="form-group">
                <label class="control-label col-md-3">Select a Project:</label>
                <div class="input-group col-md-7">
                    <select class="form-control" style="height: 150px; width: 310px; margin-right: 20px;" multiple="multiple" id="selectListItems"></select>
                    <input id="addProject" class="btn btn-default" type="button" value="Add Project" onclick="OpenDialog()" />
                </div>
            </div>
            <div class="form-group">
                <label for="inputProject" class="control-label col-md-3">Status</label>
                <div class="input-group col-md-7">
                    <select class="form-control" id="selectStatus" style="width: 150px">
                        <option>None Selected</option>
                        <option>Not Started</option>
                        <option>Started</option>
                        <option>Completed</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="inputFile" class="control-label col-md-3">SoW File</label>
                <div class="input-group col-md-7">
                    <input  class="form-control" type="file" id="inputFile" style="width: 310px; margin-right: 20px;" />
                </div>
            </div>
            <div class="form-group">
                <div class="input-group col-sm-10">
                    <input type="button" value="Create SoW" id="addSoWId" class="btn btn-default" onclick="addSoW()"/> &nbsp;&nbsp;
                    <input type="button" value="Cancel" id="cancelSow" class="btn btn-default" onclick="cancelSoW()"/>
                </div>     
            </div>
        </form>
    </div>
</div>
</asp:Content>
