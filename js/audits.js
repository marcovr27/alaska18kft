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
		query='INSERT INTO AUDITS (ID,Name) VALUES ("'+escapeDoubleQuotes(value.ID)+'","'+escapeDoubleQuotes(value.Name)+'")';
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
				query='INSERT INTO GROUPS2AUDITS (GroupID,ID,Ord) VALUES ("'+escapeDoubleQuotes(value.GroupID)+'", "'+escapeDoubleQuotes(value.ID)+'", "'+value.Ord+'")';
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
	$("#btnR"+stepaudit).removeClass( "buttonreds");
	DeleteImagesAuditTemp();
	$("#popupriskaudit").popup("close");
}