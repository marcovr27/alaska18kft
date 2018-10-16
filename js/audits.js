//SILENCE SYNC
function AuditSilenceStartSync()
{
//alert("empieza silencio");	
var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
db.transaction(GetAuditSilenceStartSync, errorCB);
}

function GetAuditSilenceStartSync(tx)
{
	//alert("Query Settings");	
	var querytosend="SELECT * FROM SETTINGS";
	tx.executeSql(querytosend, [], function(tx,results){ GetAuditSilenceStartSyncSuccess(tx,results) }, errorCB);
	
}

function GetAuditSilenceStartSyncSuccess(tx,results)
{
	var len = results.rows.length;
	if(len>0)
	{
		$("#ipsync").val(results.rows.item(0).IP);
		//alert("ip obtenido");	
		SyncSilenceAudits();
	}
}


function SyncSilenceAudits()
{
	//alert("va en silencio");
	sendAuditsarray="";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytoSyncSilenceAudits, errorCB);
	
}

function QuerytoSyncSilenceAudits(tx)
{
	var querytosend="SELECT * FROM SUBMITTEDAUDITS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QuerytosendAuditsSilenceSuccess, errorCB);
}

function QuerytosendAuditsSilenceSuccess(tx,results)
{
	//alert("1");
	
	var len = results.rows.length;
	//alert("SubmittedHours="+len);
	var array = [];
	
	//alert(len);
for (var i=0; i<results.rows.length; i++){
 row = results.rows.item(i);
 // alert(row.Title);
 array.push(JSON.stringify(row));
}

sendAuditsarray=array;
        //alert("recolectamos submittedaudits");
		sendAuditsSOwnersRows();

	
}

function sendAuditsSOwnersRows()
{
	//alert("2");
	//alert("submittedhours");
	sendAOwnersarray="";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytosendAuditsSOwners, errorCB);
	
}

function QuerytosendAuditsSOwners(tx)
{
	var querytosend="SELECT * FROM AUDITS2OWNERS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QuerytosendAuditsOwnersSSuccess, errorCB);
}

function QuerytosendAuditsOwnersSSuccess(tx,results)
{	
	//alert("3");
	var len = results.rows.length; 
	var array = [];
	for (var i=0; i<results.rows.length; i++){
 	row = results.rows.item(i);
 	array.push(JSON.stringify(row));
}

sendAOwnersarray=array;
//alert("recolecatmos owners");
sendAuditsSInspectorsRows();

	
}

function sendAuditsSInspectorsRows()
{
	//alert("submittedhours");
	//alert("4");
	sendAInspectorsarray="";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytosendAuditsSInspectors, errorCB);
	
}

function QuerytosendAuditsSInspectors(tx)
{
	var querytosend="SELECT * FROM AUDITS2INSPECTORS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QuerytosendAuditsSInspectorsSuccess, errorCB);
}

function QuerytosendAuditsSInspectorsSuccess(tx,results)
{	
	//alert("5");
	var len = results.rows.length;
	var array = [];
	for (var i=0; i<results.rows.length; i++){
 	row = results.rows.item(i);
 	array.push(JSON.stringify(row));
}
sendAInspectorsarray=array;
//alert("recolecatmos Inspectors");
		SilenceAuditToServer();	
}

function SilenceAuditToServer()
{
	//alert(6)
		var ipserver=$("#ipsync").val();
//alert("hacer post a obter mensajes");
	var obj = {};
    obj['AuditsUpdate'] =JSON.stringify(sendAuditsarray); 
    obj['Audits2Owners'] =JSON.stringify(sendAOwnersarray); 
    obj['Audits2Inspectors'] =JSON.stringify(sendAInspectorsarray);
	   $.ajax({
                    type: 'POST',
				    url: ipserver+'//SetAudits',
                    data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
					async:false,
                    success: function (response) {
					   // alert("Exito insertando Audits en el servidor");
						//alert("funciono post");
                        //DownloadMesagesSilence();
                        SendSMediaAudit()
           
                      
                    },
                    error: function (xmlHttpRequest, textStatus, errorThrown) {
					//alert("no funciono post");
                    IsSyncMessages=false;
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
					//alert(xmlHttpRequest.responseXML+" "+textStatus+" "+errorThrown);
                }
                });
	
}

function SendSMediaAudit()
{
	//alert("7");
    //alert("enviar archivos");
        
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QuerytosendSAuditMedia, errorCB);
}

function QuerytosendSAuditMedia(tx)
{
	var querytosend="SELECT * FROM AUDITMEDIA WHERE Sync='no'";
	tx.executeSql(querytosend, [], QuerytosendSAuditMediaSuccess, errorCB);
}

function QuerytosendSAuditMediaSuccess(tx,results)
{
	var  len = results.rows.length;
	//alert("Media ="+ len);
	if(len>0)
	{
		pptoshow=100/parseFloat(len, 10);
		ppinitial=0;
		var tosend=0;
		for (var i=0; i<results.rows.length; i++){
			tosend++;
			uploadSPhotoServerAudit(results.rows.item(i).Path,results.rows.item(i).SubmitID,results.rows.item(i).StepID);
		}
	}
	else
	{
        finishaudisync();
	}
}

function uploadSPhotoServerAudit(imageURI,SubmitID,StepID) {
    //alert("akaimage"+imageURI+"---->"+SubmitID+"---->"+StepID);
            var ipserver=$("#ipsync").val();
            var dt = new Date();
            var SubmitDate=dt.toYMDhrs();
            var options = new FileUploadOptions();
            options.chunkedMode = true;
            options.fileKey="recFile";
            var imagefilename = Number(new Date())+".jpg";
            options.fileName=imagefilename;
            options.mimeType="image/jpeg";
            var params = new Object();
            params.submitid = SubmitID;
            params.stepid = StepID;
            options.params = params;
            var ft = new FileTransfer();
           ft.upload(imageURI, ipserver+"/UploadFileAudit", winftpSAudit,failftpSAudit,options);
}

function winftpSAudit(r) {
    ppinitial= parseFloat(ppinitial, 10)+parseFloat(pptoshow, 10);
    if(parseInt(ppinitial, 10)==100)
    {
        //GetserviceSAudits();
        //funcion a llamar
        finishaudisync();
        
    }
}

function failftpSAudit(error) {
    alert("An error has occurred uploading file: Code = " + error.code);
}

function finishaudisync()
{
    var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytoupdatelocalFaudits, errorCB);
    

}

function QuerytoupdatelocalFaudits(tx)
{
	//alert("finalizo");
    tx.executeSql("UPDATE AUDITMEDIA SET sync='yes'");
    tx.executeSql("UPDATE SUBMITTEDAUDITS SET sync='yes'");
	tx.executeSql("UPDATE AUDITS2OWNERS SET sync='yes'");
	tx.executeSql("UPDATE AUDITS2INSPECTORS SET sync='yes'");
    //alert("terminosincronizar");

}

function GetserviceSAudits()
{
	var ipserver=$("#ipsync").val();
	var obj = {};
	                $.ajax({
                    type: 'POST',
				    url:ipserver+'//GetAudits',
					data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						InsertDatabaseSAudits(response.d);
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
					IsSyncMessages=false;			
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                   // alert("Error");
                }
                });
	
	
}

function InsertDatabaseSAudits(newdatabase)
{
		newauditsdatatoinsert=newdatabase;
		var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      	db.transaction(QuerytoinsertSAudits, errorCB);
	
}

function QuerytoinsertSAudits(tx)
{
		tx.executeSql("DELETE FROM AUDITS");
		tx.executeSql("DELETE FROM AUDITSUBPARTS");
		tx.executeSql("DELETE FROM GROUPS2AUDITS");
		tx.executeSql("DELETE FROM SUBMITTEDAUDITS");
		tx.executeSql("DELETE FROM AUDITQUESTS");
		tx.executeSql("DELETE FROM AUDITS2SUBPARTS");
	var query;
	var obj;
	//alert("Items "+obj.length);
	var itemcount=0;
	 try
	 {
	obj = jQuery.parseJSON(newauditsdatatoinsert.Audits);
    $.each(obj, function (key, value) {
		var locacion="";
		if(value.Location==null || value.Location=="null")
		{
			locacion="";
		}
		else
		{
			locacion=escapeDoubleQuotes(value.Location);
		}
		query='INSERT INTO AUDITS (ID,Name,Location) VALUES ("'+escapeDoubleQuotes(value.ID)+'","'+escapeDoubleQuotes(value.Name)+'","'+locacion+'")';
		alert(query);
		tx.executeSql(query);
		itemcount++;
	 });
	 alert("Audits: "+itemcount);

	 }
	 catch(error)
	 {
		 alert(error);

		 
	 }
	 

	 itemcount=0;
	 try
	 {
	  if(newauditsdatatoinsert.AuditSubParts!="")
	  {
		obj=jQuery.parseJSON(newauditsdatatoinsert.AuditSubParts);
		$.each(obj, function (key, value) {
			query='INSERT INTO AUDITSUBPARTS (Name) VALUES ("'+escapeDoubleQuotes(value.Name)+'")';
			tx.executeSql(query);
			itemcount++;
		 });

	  }	 

	 }
	 catch(error)
	 {
		 alert(error);
		 
	 }

	 itemcount=0;

	 try
	 {
		 if(newauditsdatatoinsert.Groups2Audits!="")
		 {
			obj=jQuery.parseJSON(newauditsdatatoinsert.Groups2Audits);
			$.each(obj, function (key, value) {
				var locacion="";
				if(value.Location==null || value.Location=="null")
				{
					locacion="";
				}
				else
				{
					locacion=escapeDoubleQuotes(value.Location);
				}
				if(value.Ord=="null" || value.Ord==null)
				{
					ordgg="0";
				}
				else
				{
					ordgg=value.Ord;

				}
				query='INSERT INTO GROUPS2AUDITS (GroupID,ID,Ord,Location) VALUES ("'+escapeDoubleQuotes(value.GroupID)+'", "'+escapeDoubleQuotes(value.ID)+'", "'+ordgg+'","'+locacion+'")';
				tx.executeSql(query);
				itemcount++;
			 });
			// alert("Groups2Audits:"+ itemcount);

		 }

	 }
	 catch(error)
	 {
		 alert(error);
		 
	 }

	 itemcount=0;
	
	 try
	 {
		 if(newauditsdatatoinsert.SubmittedAudits!="")
		 {
			obj=jQuery.parseJSON(newauditsdatatoinsert.SubmittedAudits);
			$.each(obj, function (key, value) {
				query='INSERT INTO SUBMITTEDAUDITS (SubmitID,AuditID,StepID,Comments,Status,Date,UserID,Sync,NumFiles) VALUES ("'+value.SubmitID+'", "'+value.AuditID+'", "'+value.StepID+'", "'+escapeDoubleQuotes(value.Comments)+'", "'+value.Status+'", "'+value.Date+'", "'+value.UserID+'","yes","'+value.NumFiles+'")';
			//	alert(query);
				tx.executeSql(query);
				itemcount++;
			 });

		 }

	 }
	 catch(error)
	 {
		 alert(error);
		 
	 }
	 itemcount=0;
	 try
	 {
		 if(newauditsdatatoinsert.AuditsQuests!="")
		 {
			obj=jQuery.parseJSON(newauditsdatatoinsert.AuditsQuests);
			$.each(obj, function (key, value) {
				query='INSERT INTO AUDITQUESTS (AuditID,StepID,Text,SubPart,OrdNum) VALUES ("'+escapeDoubleQuotes(value.AuditID)+'", "'+escapeDoubleQuotes(value.StepID)+'", "'+escapeDoubleQuotes(value.Text)+'", "'+escapeDoubleQuotes(value.SubPart)+'", "'+value.OrdNum+'")';
				//alert(query);
				tx.executeSql(query);
				itemcount++;
			 });
		 }

	 }
	 catch(error)
	 {
		 alert(error);
	 }

	 itemcount=0;	 
	 try
	 {
		 if(newauditsdatatoinsert.Audits2SubParts!="")
		 {
			obj=jQuery.parseJSON(newauditsdatatoinsert.Audits2SubParts);
			$.each(obj, function (key, value) {
				query='INSERT INTO AUDITS2SUBPARTS (ID,SubPart) ("'+escapeDoubleQuotes(value.ID)+'", "'+escapeDoubleQuotes(value.SubPart)+'")';
				tx.executeSql(query);
				itemcount++;
			 });
		 }

	 }
	 catch(error)
	 {
		 alert(error);
		 
	 }	
}



function CancelRisk()
{
	var stepaudit=$("#Hidstepaudit").val();
	var eseditar=$("#isdeletemondal").val();
	//alert(takepicturep);
	if(eseditar=="0")
	{
		if(takepicturep==0)
		{
			DeleteImagesAuditTemp();
			$("#popupriskaudit").popup("close");
			$("#popupstartrisklist").popup("open");
	
		}
		else
		{
			navigator.notification.prompt(
				'Are you sure you wish to cancel creating this issue? You will lose and have to retake any pictures you have taken',  // message
				onPromptCancelRisk,                  // callback to invoke
				'Cancel Risk',            // title
				['No','Yes']              // buttonLabels
			);
	
		}

	}
	else
	{
		$("#popupriskaudit").popup("close");
		$("#popupstartrisklist").popup("open");

	}

}

function onPromptCancelRisk(results) {
	if(results.buttonIndex==2)
	{
		DeleteImagesAuditTemp();
		$("#popupriskaudit").popup("close");
		$("#popupstartrisklist").popup("open");

	}


}

function CheckDBAudit()
{
	
}

function AuditNAclick(id)
{
	//alert(id);
		$("#btnNA"+id).addClass("buttonna");
		$("#btnS"+id).removeClass("buttongreens");
		$("#btnR"+id).removeClass("buttonreds");	
}

function FillPersonnelAudit()
{
		var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryPersonnelAudit, errorCB);
	
}
function QueryPersonnelAudit(tx)
{
  
	tx.executeSql("SELECT * FROM Users WHERE LevelType <>'9 - Trainee' ORDER BY LastName,FirstName", [], QueryPersonnelAuditSuccess, errorCB);
}
function QueryPersonnelAuditSuccess(tx,results)
{
	var len = results.rows.length;
	var selecthtml='<option value="0">Choose a user</option>'; 
	for (var i=0; i<len; i++){
	      var nameuser=results.rows.item(i).Username;
		  var fname=results.rows.item(i).FirstName;
		  var lname=results.rows.item(i).LastName;
		  var fullname=lname+' '+fname;
		 selecthtml+='<option value="'+nameuser+'">'+fullname+'</option>';
	}
	$("#selectAssignee").html(selecthtml);		
}

function CloseRiskMenu()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryCloseRiskMenu, errorCB);
	$("#popupstartrisklist").popup("close");
}

function QueryCloseRiskMenu(tx)
{
	var StepIDTemp=$("#Hidstepaudit").val();
	var query="SELECT * FROM TEMPSUBMITTEDAUDITS WHERE StepID='"+StepIDTemp+"'";
	tx.executeSql(query, [], QueryCloseRiskMenuSuccess, errorCB);
}

function QueryCloseRiskMenuSuccess(tx,results)
{
	var len = results.rows.length;
	var StepIDTemp=$("#Hidstepaudit").val();
	if(len<=0)
	{		//chicharo
		$("#btnR"+StepIDTemp).removeClass("buttonreds");
	}
	picturescount();
}

function OpenListRisk(id)
{

}

function SaveTempIssue()
{
	var editornew=$("#isdeletemondal").val();
	if(editornew=="0")
	{
		var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
		db.transaction(function(tx){ QuerySaveTempIssue(tx) },errorCBPAudits);

	}
	else
	{
		var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    	db.transaction(function(tx){ QueryEditRiskN(tx) },errorCBPAudits);

	}

}

function QueryEditRiskN(tx)
{
	var descriptionrisk = $("#sabecomment").val();
	var followuaction =  $("#followupactioncomment").val();
	var assignee= $("#selectAssignee").val();
	var riskpriority= $("#selectRiskPriority").val();
	var dateriskaudit= $("#dateAuditRisk").val();
	var insertNow=true;
	//alert(followuaction);
	//alert("fotos = "+takepicturep);
	if(descriptionrisk=="" || descriptionrisk==null)
	{
		insertNow=false;
		navigator.notification.alert("Please enter a description.", null, 'FieldTracker', 'Accept');

	}
	else if(followuaction=="" || followuaction==null)
	{
		insertNow=false;
		navigator.notification.alert("Please enter a follow-up action.", null, 'FieldTracker', 'Accept');

	}
	else if(assignee=="0")
	{
		insertNow=false;
		navigator.notification.alert("Please select an assignee", null, 'FieldTracker', 'Accept');

	}
	else if(riskpriority=="0")
	{
		insertNow=false;
		navigator.notification.alert("Please select a priority.", null, 'FieldTracker', 'Accept');
	}
	else if(dateriskaudit=="" || dateriskaudit== null)
	{
		insertNow=false;
		navigator.notification.alert("Please select a due date for the follow-up action.", null, 'FieldTracker', 'Accept');
	}
	else if (takepicturep=="0")
	{
		insertNow=false;
		navigator.notification.alert("You must attach at least one picture.", null, 'FieldTracker', 'Accept');

	}
	if(insertNow)
	{
		var iduss=$("#idissuehide").val();
		var DescriptionTemp=$("#sabecomment").val();
		var NumFilesTemp=$("#lentempid").val();
		var IssueIDTemp=$("#idissuehide").val();
		var AssignTemp=$("#selectAssignee").val();
		var PiorityTemp=$("#selectRiskPriority").val();
		var ActionTemp=$("#followupactioncomment").val();
		var DueDateTemp=$("#dateAuditRisk").val();
		var query='UPDATE TEMPSUBMITTEDAUDITS SET Description="'+DescriptionTemp+'",NumFiles="'+NumFilesTemp+'",IssueID="'+IssueIDTemp+'",AssignUserID="'+AssignTemp+'",Priority="'+PiorityTemp+'",Action="'+ActionTemp+'",DueDate="'+DueDateTemp+'" WHERE IssueID="'+iduss+'"';
		tx.executeSql(query);
		//alert(query);
		$("#popupriskaudit").popup("close");
		$("#popupstartrisklist").popup("open");
		SearchAllIssuesForStep();
	}

}

function QuerySaveTempIssue(tx)
{
	var descriptionrisk = $("#sabecomment").val();
	var followuaction =  $("#followupactioncomment").val();
	var assignee= $("#selectAssignee").val();
	var riskpriority= $("#selectRiskPriority").val();
	var dateriskaudit= $("#dateAuditRisk").val();
	var insertNow=true;
	//alert(followuaction);
	//alert("fotos = "+takepicturep);
	if(descriptionrisk=="" || descriptionrisk==null)
	{
		insertNow=false;
		navigator.notification.alert("Please enter a description.", null, 'FieldTracker', 'Accept');

	}
	else if(followuaction=="" || followuaction==null)
	{
		insertNow=false;
		navigator.notification.alert("Please enter a follow-up action.", null, 'FieldTracker', 'Accept');

	}
	else if(assignee=="0")
	{
		insertNow=false;
		navigator.notification.alert("Please select an assignee", null, 'FieldTracker', 'Accept');

	}
	else if(riskpriority=="0")
	{
		insertNow=false;
		navigator.notification.alert("Please select a priority.", null, 'FieldTracker', 'Accept');
	}
	else if(dateriskaudit=="" || dateriskaudit== null)
	{
		insertNow=false;
		navigator.notification.alert("Please select a due date for the follow-up action.", null, 'FieldTracker', 'Accept');
	}
	else if (takepicturep=="0")
	{
		insertNow=false;
		navigator.notification.alert("You must attach at least one picture.", null, 'FieldTracker', 'Accept');

	}
	if(insertNow)
	{
		var AuditIDTemp=$("#auditIDL").val();
		var StepIDTemp=$("#Hidstepaudit").val();
		var DescriptionTemp=$("#sabecomment").val();
		var NumFilesTemp=$("#lentempid").val();
		var IssueIDTemp=$("#idissuehide").val();
		var AssignTemp=$("#selectAssignee").val();
		var PiorityTemp=$("#selectRiskPriority").val();
		var ActionTemp=$("#followupactioncomment").val();
		var DueDateTemp=$("#dateAuditRisk").val();
		var ActionStatusTemp="To Do";
		var query='INSERT INTO TEMPSUBMITTEDAUDITS (AuditID,StepID,Description,NumFiles,IssueID,AssignUserID,Priority,Action,DueDate) VALUES ("'+AuditIDTemp+'","'+StepIDTemp+'","'+DescriptionTemp+'","'+NumFilesTemp+'","'+IssueIDTemp+'","'+AssignTemp+'","'+PiorityTemp+'","'+ActionTemp+'","'+DueDateTemp+'")';
		tx.executeSql(query);
		$("#popupriskaudit").popup("close");
		$("#popupstartrisklist").popup("open");
		SearchAllIssuesForStep();

	}
}

function SearchAllIssuesForStep()
{
	//alert("vano");
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(function(tx){ QuerySearchAllIssuesForStep(tx) }, errorCBPAudits);

}

function QuerySearchAllIssuesForStep(tx)
{
	var StepIDTemp=$("#Hidstepaudit").val();
	var query="SELECT * FROM TEMPSUBMITTEDAUDITS WHERE StepID='"+StepIDTemp+"'";
	//alert(query);
	tx.executeSql(query, [], QuerySearchAllIssuesForStepSuccess,errorCBPAudits);
}

function QuerySearchAllIssuesForStepSuccess(tx,results)
{
	//alert("items");
	var len = results.rows.length;
	var tablehtml="";
	var tb = $('#ListRiskDraw');
	var desc1="";
	if(len>0)
	{
		for (var i=0; i<results.rows.length; i++){
			var str=results.rows.item(i).Description;
			desc1=str.substring(0, 47);
			if(str.length>=47)
			{
				desc1=desc1+"...";
			}
			tablehtml+='<tr data-name="'+results.rows.item(i).IssueID+'"><td width="70%">'+desc1+'</td><td width="15%"><a href="javascript:openEditRisk('+"'"+results.rows.item(i).IssueID+"'"+');"  data-transition="slideup" data-theme="b"  class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-gear ui-btn-icon-left ui-btn-a">Edit</a></td><td width="15%"><a href="javascript:openDeleteRisk('+"'"+results.rows.item(i).IssueID+"'"+');"  data-transition="slideup" data-theme="b"  class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-gear ui-btn-icon-left ui-btn-a">Delete</a></td></tr>';

		}

	}

	tb.empty().append(tablehtml);
	$("#table-ListRisk").table("refresh");
	$("#table-ListRisk").trigger('create');
}

function openEditRisk(id)
{
	//alert("Edit "+id);
	$("#idissuehide").val(id);
	$("#isdeletemondal").val("1");
	takepicturep=1;
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(function(tx){ QueryopenEditRisk(tx) }, errorCBPAudits);
}

function QueryopenEditRisk(tx)
{
	var StepIDTemp=$("#Hidstepaudit").val();
	var IssueIDTemp=$("#idissuehide").val();
	var query="SELECT * FROM TEMPSUBMITTEDAUDITS WHERE StepID='"+StepIDTemp+"' AND IssueID='"+IssueIDTemp+"'";
	tx.executeSql(query, [], QueryopenEditRiskSuccess,errorCBPAudits);

}

function QueryopenEditRiskSuccess(tx,results)
{
	var len = results.rows.length;
	if(len>0)
	{
	$("#riskheader").html("Edit Issue");	
	$("#sabecomment").val(results.rows.item(0).Description);	
	$("#followupactioncomment").val(results.rows.item(0).Action);
	$("#selectAssignee").val(results.rows.item(0).AssignUserID);
	$("#selectRiskPriority").val(results.rows.item(0).Priority);
	var reminderSelectedAssigne = $("#selectAssignee");
	reminderSelectedAssigne.val(results.rows.item(0).AssignUserID).attr('selected', true).siblings('option').removeAttr('selected'); 
	reminderSelectedAssigne.selectmenu("refresh", true);
	var reminderSelectedPriority = $("#selectRiskPriority");
	reminderSelectedPriority.val(results.rows.item(0).Priority).attr('selected', true).siblings('option').removeAttr('selected'); 
	reminderSelectedPriority.selectmenu("refresh", true);
	$("#dateAuditRisk").val(results.rows.item(0).DueDate);
	searchfilesphotosaudit()
	$("#popupstartrisklist").popup("close");
	$("#popupriskaudit").popup("open");
	}


}

function openDeleteRisk(id)
{
	$("#iddeleterisk").val(id);
	navigator.notification.prompt(
		'Are you sure you wish to delete this issue and all of the associated pictures?',  // message
		onPromptDeleteRisk,                  // callback to invoke
		'Delete Risk',            // title
		['No','Yes']              // buttonLabels
	);
	//alert("Delete "+id);

}

function onPromptDeleteRisk(results) {
	if(results.buttonIndex==2)
	{
		var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    	db.transaction(function(tx){ QueryonPromptDeleteRisk(tx) },errorCBPAudits);

	}
}

function QueryonPromptDeleteRisk(tx)
{
  var idtodelete=$("#iddeleterisk").val();
  tx.executeSql("DELETE FROM TEMPAUDITPHOTO WHERE IssueID='"+idtodelete+"'");
  tx.executeSql("DELETE FROM TEMPSUBMITTEDAUDITS WHERE IssueID='"+idtodelete+"'");
  SearchAllIssuesForStep();
}

