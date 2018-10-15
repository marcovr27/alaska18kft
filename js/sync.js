// Sync Functions

///////<<<<<<<<<<<<============================= WEB SERVICES =========================================>>>>>>>>>>>///////
function newsettingstodb()
{
	//alert("newsettings function");
	var ipaddress=$("#ipsettinginit").val();
	var val_ip=/^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/;
	//if(!val_ip.test(ipaddress)) {
	//	navigator.notification.alert("Invalid IP Address", null, 'FieldTracker', 'Accept');
//	}
	//else
	//{
		var todo="0";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
         db.transaction(function(tx){ Querynewsavesettings(tx,todo) }, errorCB,SuccesnewS);
	//}
	
	
	
}

function Querynewsavesettings(tx,todo)
{
	var ipaddress=$("#ipsettinginit").val();
	var language=$("#select-langinit").val();
	var query="";
	
		query='INSERT INTO SETTINGS (Language,IP) VALUES ("'+language+'","'+ipaddress+'")';
	

	tx.executeSql(query);
	query='UPDATE SETTINGS SET IP="'+ipaddress+'"';
	tx.executeSql(query);
	
}

function SuccesnewS()
{
	//alert("success settings saved");
	checkifexistdbreg("1");
	
}


function checkifexistdbreg(typeofsync)
{
	//alert("start type of sync: "+typeofsync);
		var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(function(tx){ Querytocheckifdb(tx,typeofsync) }, errorCB);
	// $(':mobile-pagecontainer').pagecontainer('change', '#pageSettingsInit', {
      //  transition: 'flip',
        //changeHash: false,
        //reverse: true,
        //showLoadMsg: true
    //});
	
}

function Querytocheckifdb(tx,typeofsync)
{
   // alert("GET URL");
	var querytosend="SELECT * FROM SETTINGS";
	tx.executeSql(querytosend, [], function(tx,results){ QuerytocheckifdbSuccess(tx,results,typeofsync) }, errorCB);
	
}

function QuerytocheckifdbSuccess(tx,results,typeofsync)
{
	var len = results.rows.length;
	if(len>0)
	{
		$("#ipsync").val(results.rows.item(0).IP);
		//startSync(sendprocedures,sendDataToServer,Getservicedata);//sendprocedures();
		if(typeofsync==1)
		{
			//alert("Call Sync function");
			sendprocedures();
		}
		else
		{
			silencesync();
		}
		
	}
	else
	{
		 $(':mobile-pagecontainer').pagecontainer('change', '#pageSettingsInit', {
        transition: 'flip',
        changeHash: false,
        reverse: true,
        showLoadMsg: true
    });
		
	}
	
}

function GetMeasurements()
{
	var ipserver=$("#ipsync").val();
	var obj = {};
    //alert("GetMeas");
	$("#progressheader").html(" ");
	//progressheader
	$("#progressheader").html("Downloading data...");
		$("#progressMessage").html("Post To GetMeasurements");
		pbar.setValue(0);
	                $.ajax({
                    type: 'POST',
				    url:ipserver+'//GetMeasurements',
					data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						InsertDatabaseMeas(response.d);
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
							$("#progressheader").html("Can not connect to server");
							$("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
					IsSyncMessages=false;		
					setTimeout( function(){ $("#generic-dialog").dialog("close"); }, 10000 );
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                   // alert("Error");
                }
                });
}

function InsertDatabaseMeas(newdatabase)
{
     //alert("MEas Success")
	$("#progressMessage").html("Successful connection");
		pbar.setValue(1);
		newmeasdatatoinsert=newdatabase;
		var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      	db.transaction(QuerytoinsertMeas, errorCB);	
}

function QuerytoinsertMeas(tx)
{
	//alert("deleteoldrecords");
	//alert("Insert new data GetMessages");
	$("#progressMessage").html("Deleting old records");
		pbar.setValue(4);
		//alert("Deleting "+idusera);
		tx.executeSql("DELETE FROM MEASUREMENTS");
		tx.executeSql("DELETE FROM MEASDATA");
		tx.executeSql("DELETE FROM STEP2MEAS");


	$("#progressMessage").html("Ready to insert new records");
	var query;
	var obj;
	//alert("Items "+obj.length);
	var itemcount=0;
	 try
	 {
		obj = jQuery.parseJSON(newmeasdatatoinsert.Measurements);
    $.each(obj, function (key, value) {
		query='INSERT INTO MEASUREMENTS (MeasID,MeasDesc,Units,FieldType,MinValue,MaxValue) VALUES ("'+value.MeasID+'", "'+escapeDoubleQuotes(value.MeasDesc)+'", "'+value.Units+'", "'+value.FieldType+'", "'+value.MinValue+'","'+value.MaxValue+'")';
		//alert(query);
		tx.executeSql(query);
		itemcount++;
     });
	 //alert("Certifications: "+itemcount);
	 
	 	$("#progressMessage").html("Measurements updated");
	pbar.setValue(10);
	 }
	 catch(error)
	 {
		 alert("Measurements: "+error);
		 $("#progressMessage").html("Error updating Measurements "+error);
			pbar.setValue(30);
		 
	 }
	 itemcount=0;
	 
	 try
	 {
		obj=jQuery.parseJSON(newmeasdatatoinsert.MeasData);
    $.each(obj, function (key, value) {
		query='INSERT INTO MEASDATA (MeasID,DropDownData) VALUES ("'+value.MeasID+'", "'+escapeDoubleQuotes(value.DropDownData)+'")';
		tx.executeSql(query);
		itemcount++;
     });
	 //("USERS2CERTS: "+itemcount);
	 
	 	$("#progressMessage").html("Measdata updated");
	pbar.setValue(10);
	 }
	 catch(error)
	 {
		 alert("Measdata "+error);
		 $("#progressMessage").html("Error updating measdata "+error);
			pbar.setValue(30);
		 
	 }

	 itemcount=0;
	 
	 try
	 {
	obj=jQuery.parseJSON(newmeasdatatoinsert.Steps2Meas);
    $.each(obj, function (key, value) {
		query='INSERT INTO STEP2MEAS (StepID,MeasID) VALUES ("'+value.StepID+'", "'+value.MeasID+'")';
		tx.executeSql(query);
		itemcount++;
     });
	 //("USERS2CERTS: "+itemcount);
	 
	 	$("#progressMessage").html("Measdata updated");
	pbar.setValue(10);
	 }
	 catch(error)
	 {
		 alert(error);
		 $("#progressMessage").html("Error updating measdata "+error);
			pbar.setValue(30);
		 
	 }
	 
	
		 
	 $("#progressMessage").html("Certifications updated");
		pbar.setValue(100);

	$("#progressMessage").html("");
		pbar.setValue(100);
		SendMediaAudit();

}
function GetWpisx()
{
	//alert("GetWpisx");
	var ipserver=$("#ipsync").val();
	var obj = {};
	if(!!sessionStorage.userid)
	{
		obj['UserID'] =sessionStorage.userid;
	}
	else
	{
		obj['UserID'] ="xxxxxxxx";
		
	}

	$("#progressheader").html(" ");
	//progressheader
	$("#progressheader").html("Downloading data...");
		$("#progressMessage").html("Post To GetWpis");
		pbar.setValue(0);
		//alert("listo para el post: "+ipserver+'//GetStructureData');
	                $.ajax({
                    type: 'POST',
                    //url: 'http://dc4life78-001-site6.dtempurl.com/ServiceFt.asmx//GetStructureData',
				    url:ipserver+'//GetWpis',
					data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						InsertDatabaseWPIS(response.d);
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
							$("#progressheader").html("Can not connect to server");
							$("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
					IsSyncMessages=false;		
					setTimeout( function(){ $("#generic-dialog").dialog("close"); }, 10000 );
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                   // alert("Error");
                }
                });	
	
}

function InsertDatabaseWPIS(newdatabase)
{

	$("#progressMessage").html("Successful connection");
		pbar.setValue(1);
		newcertsdatatoinsert=newdatabase;
		var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      	db.transaction(QuerytoinsertWpisx, errorCBPA);
	
}

function QuerytoinsertWpisx(tx)
{
	//alert("deleteoldrecords");
	//alert("Insert new data GetMessages");
	$("#progressMessage").html("Deleting old records");
	var userids;
	if(!!sessionStorage.userid)
	{
		userids =sessionStorage.userid;
	}
	else
	{
		userids ="xxxxxxxx";
		
	}
		pbar.setValue(2);
		//alert("Deleting "+idusera);
		tx.executeSql("DELETE FROM SUBMITTEDWPIS");


	$("#progressMessage").html("Ready to insert new records");
	var query;
	var obj;
	//alert("Items "+obj.length);
	var itemcount=0;
	 try
	 {
		obj = jQuery.parseJSON(newcertsdatatoinsert.Wpis);
    	$.each(obj, function (key, value) {
	    var query="INSERT INTO SUBMITTEDWPIS (SubmitID,EmpDate,Shift,UserID,Status,SupID,WPI1,WPI2,WPI3,WPI1Status,WPI2Status,WPI3Status,HI1,HI2,HI3,CAT1,CAT2,CAT3,Sync,SyncTwo) VALUES ('"+value.SubmitID+"','"+value.EmpDate+"','"+value.Shift+"','"+value.UserID+"','"+value.Status+"','"+value.SupID+"','"+escapeDoubleQuotes(value.WPI1)+"','"+escapeDoubleQuotes(value.WPI2)+"','"+escapeDoubleQuotes(value.WPI3)+"','"+value.WPI1Status+"','"+value.WPI2Status+"','"+value.WPI3Status+"','"+escapeDoubleQuotes(value.HI1)+"','"+escapeDoubleQuotes(value.HI2)+"','"+escapeDoubleQuotes(value.HI3)+"','"+escapeDoubleQuotes(value.CAT1)+"','"+escapeDoubleQuotes(value.CAT2)+"','"+escapeDoubleQuotes(value.CAT3)+"','no','no')";
		//alert(query);
		tx.executeSql(query);
		itemcount++;
     });
	// alert("Wpis: "+itemcount);
	 
	 	$("#progressMessage").html("WPIS updated");
	pbar.setValue(10);
	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			alert("WPIS ERROR: Web service invalid data");

		}
		else
		{
		   alert("WPIS "+error);

		}
		 $("#progressMessage").html("Error updating WPIS "+error);
			pbar.setValue(30);
		 
	 }
	 
		 
	 $("#progressMessage").html("Inspections updated");
		pbar.setValue(100);

	$("#progressMessage").html("");
		pbar.setValue(100);
		//SendMediaAudit();
	  GetMeasurements();	
}

function GetserviceCertifications()
{
	//alert("GetserviceCertifications");
	var ipserver=$("#ipsync").val();
	var obj = {};

	$("#progressheader").html(" ");
	//progressheader
	$("#progressheader").html("Downloading data...");
		$("#progressMessage").html("Post To GetCertificationsData");
		pbar.setValue(0);
		//alert("listo para el post: "+ipserver+'//GetStructureData');
	                $.ajax({
                    type: 'POST',
                    //url: 'http://dc4life78-001-site6.dtempurl.com/ServiceFt.asmx//GetStructureData',
				    url:ipserver+'//GetCertificationsData',
					data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						InsertDatabaseCerts(response.d);
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
							$("#progressheader").html("Can not connect to server");
							$("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
					IsSyncMessages=false;		
					setTimeout( function(){ $("#generic-dialog").dialog("close"); }, 10000 );
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                   // alert("Error");
                }
                });	
	
}

function InsertDatabaseCerts(newdatabase)
{

	$("#progressMessage").html("Successful connection");
		pbar.setValue(1);
		newcertsdatatoinsert=newdatabase;
		var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      	db.transaction(QuerytoinsertCerts, errorCB);
	
}

function QuerytoinsertCerts(tx)
{
	//alert("deleteoldrecords");
	//alert("Insert new data GetMessages");
	$("#progressMessage").html("Deleting old records");
		pbar.setValue(2);
		//alert("Deleting "+idusera);
		tx.executeSql("DELETE FROM CERTIFICATIONS");
		tx.executeSql("DELETE FROM USERS2CERTS");


	$("#progressMessage").html("Ready to insert new records");
	var query;
	var obj;
	//alert("Items "+obj.length);
	var itemcount=0;
	 try
	 {
		obj = jQuery.parseJSON(newcertsdatatoinsert.Certifications);
    	$.each(obj, function (key, value) {
		query='INSERT INTO CERTIFICATIONS (ID,Title,Desc,Type,ReqAllUsers,Expires,Months,Years,Days) VALUES ("'+escapeDoubleQuotes(value.ID)+'", "'+escapeDoubleQuotes(value.Title)+'", "'+escapeDoubleQuotes(value.Desc)+'", "'+escapeDoubleQuotes(value.Type)+'", "'+value.ReqAllUsers+'", "'+escapeDoubleQuotes(value.Expires)+'", "'+value.Months+'", "'+value.Years+'","'+value.Days+'")';
		//alert(query);
		tx.executeSql(query);
		itemcount++;
     });
	 //alert("Certifications: "+itemcount);
	 
	 	$("#progressMessage").html("Certifications updated");
	pbar.setValue(10);
	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			alert("CERTIFICATIONS ERROR: Web service invalid data");

		}
		else
		{
		   alert("CERTIFICATIONS "+error);

		}
		 $("#progressMessage").html("Error updating Certifications "+error);
			pbar.setValue(30);
		 
	 }
	 itemcount=0;
	 
	 try
	 {
		obj=jQuery.parseJSON(newcertsdatatoinsert.Users2Certs);
    	$.each(obj, function (key, value) {
		query='INSERT INTO USERS2CERTS (FTID,UserID,ID,Date,Expiration,AlertSent,CertFile,AssesorID,PrintID) VALUES ("'+"ft"+itemcount+'","'+escapeDoubleQuotes(value.UserID)+'", "'+escapeDoubleQuotes(value.ID)+'", "'+escapeDoubleQuotes(value.Date)+'", "'+escapeDoubleQuotes(value.Expiration)+'", "'+value.AlertSent+'", "'+value.CertFile+'", "'+value.AssesorID+'","'+value.PrintID+'")';
		tx.executeSql(query);
		itemcount++;
     	});
	 //("USERS2CERTS: "+itemcount);
	 
	 	$("#progressMessage").html("USERS2CERTS updated");
	pbar.setValue(10);
	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			alert("USERS2CERTS ERROR: Web service invalid data");

		}
		else
		{
		   alert("USERS2CERTS "+error);

		}
		 $("#progressMessage").html("Error updating USERS2CERTS "+error);
			pbar.setValue(30);
		 
	 }
	 
	
		 
	 $("#progressMessage").html("Certifications updated");
		pbar.setValue(100);

	$("#progressMessage").html("");
		pbar.setValue(100);
		//SendMediaAudit();
	 // GetMeasurements();
	 GetWpisx();

			
		
  //sendprocedures();	
}

function GetClientName()
{
	var ipserver=$("#ipsync").val();
	var obj = {};

	$("#progressheader").html(" ");
	//progressheader
	$("#progressheader").html("Downloading data...");
		$("#progressMessage").html("Post To GetClient");
		pbar.setValue(0);
		//alert("listo para el post: "+ipserver+'//GetAudits');
	                $.ajax({
                    type: 'POST',
				    url:ipserver+'//GetClient',
					data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						//alert(response.d);
						InsertDatabaseClientName(response.d);
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
							$("#progressheader").html("Can not connect to server");
							$("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
					IsSyncMessages=false;		
					setTimeout( function(){ $("#generic-dialog").dialog("close"); }, 10000 );
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                    alert("Error");
                }
                });

}

function InsertDatabaseClientName(newdatabase)
{
   // alert("lsito audits");
	$("#progressMessage").html("Successful connection");
		pbar.setValue(1);
		newclientnametoinsert=newdatabase;
		var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      	db.transaction(QuerytoinsertClientName, errorCBPAudits);
}

function QuerytoinsertClientName(tx)
{
	$("#progressMessage").html("Deleting old records");
		pbar.setValue(2);
		tx.executeSql("DELETE FROM CLIENTNAME");
	$("#progressMessage").html("Ready to insert new records");
	var query;
	var obj;
	//alert("audits sync");
	var itemcount=0;
	 try
	 {
	obj=jQuery.parseJSON(newclientnametoinsert.ClientName);	 
    $.each(obj, function (key, value) {
		query='INSERT INTO CLIENTNAME (Name) VALUES ("'+value.ClientName+'")';
		//alert(query);
		tx.executeSql(query);
		itemcount++;
     });
	// alert("Audits: "+itemcount);
	 
	 	$("#progressMessage").html("Audits updated");
	pbar.setValue(12);
	 }
	 catch(error)
	 {
		 if(error=="SyntaxError: Unexpected token E")
		 {
			 alert("CLIENTNAME ERROR: Web service invalid data");

		 }
		 else
		 {
			alert("CLIENTNAME "+error);

		 }
		 
		 $("#progressMessage").html("Error updating ClientName"+error);
			pbar.setValue(15);
		 
	 }
	 	$("#progressMessage").html("ClientName completed updated");
		pbar.setValue(100);

		$("#progressMessage").html("");
		pbar.setValue(100);
		GetserviceCertifications();		
		
  //sendprocedures();	
}

function GetserviceAudits()
{
	var ipserver=$("#ipsync").val();
	var obj = {};

	$("#progressheader").html(" ");
	//progressheader
	$("#progressheader").html("Downloading data...");
		$("#progressMessage").html("Post To GetAudits");
		pbar.setValue(0);
		//alert("listo para el post: "+ipserver+'//GetAudits');
	                $.ajax({
                    type: 'POST',
				    url:ipserver+'//GetAudits',
					data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						//alert(response.d);
						InsertDatabaseAudits(response.d);
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
							$("#progressheader").html("Can not connect to server");
							$("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
					IsSyncMessages=false;		
					setTimeout( function(){ $("#generic-dialog").dialog("close"); }, 10000 );
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                    alert("Error");
                }
                });
	
	
}

function InsertDatabaseAudits(newdatabase)
{
   // alert("lsito audits");
	$("#progressMessage").html("Successful connection");
		pbar.setValue(1);
		newauditsdatatoinsert=newdatabase;
		var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      	db.transaction(QuerytoinsertAudits, errorCBPAudits);
	
}

function QuerytoinsertAudits(tx)
{
	$("#progressMessage").html("Deleting old records");
		pbar.setValue(2);
		tx.executeSql("DELETE FROM AUDITS");
		tx.executeSql("DELETE FROM AUDITSUBPARTS");
		tx.executeSql("DELETE FROM GROUPS2AUDITS");
		tx.executeSql("DELETE FROM AUDITQUESTS");
		tx.executeSql("DELETE FROM AUDITS2SUBPARTS");
	$("#progressMessage").html("Ready to insert new records");
	var query;
	var obj;
	//alert("audits sync");
	var itemcount=0;
	 try
	 {
	obj=jQuery.parseJSON(newauditsdatatoinsert.Audits);	 
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
		//alert(query);
		tx.executeSql(query);
		itemcount++;
     });
	// alert("Audits: "+itemcount);
	 
	 	$("#progressMessage").html("Audits updated");
	pbar.setValue(12);
	 }
	 catch(error)
	 {
		 if(error=="SyntaxError: Unexpected token E")
		 {
			 alert("AUDITS ERROR: Web service invalid data");

		 }
		 else
		 {
			alert("AUDITS "+error);

		 }
		 
		 $("#progressMessage").html("Error updating Audits"+error);
			pbar.setValue(15);
		 
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
		 //("USERS2CERTS:4 "+itemcount);
		 
			 $("#progressMessage").html("AUDITSUBPARTS updated");
		pbar.setValue(35);

	  }	 

	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			alert("AUDITSUBPARTS ERROR: Web service invalid data");

		}
		else
		{
		   alert("AUDITSUBPARTS "+error);

		}
		 $("#progressMessage").html("Error updating AUDITSUBPARTS"+error);
			pbar.setValue(30);
		 
	 }

	 itemcount=0;

	 try
	 {
		 if(newauditsdatatoinsert.Groups2Audits!="")
		 {
			var ordgg="0";
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
				//alert(query);
				tx.executeSql(query);
				itemcount++;
			 });
			// alert("Groups2audits: "+itemcount);
			 
				 $("#progressMessage").html("GROUPS2AUDITS updated");
			pbar.setValue(50);

		 }

	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			alert(" GROUPS2AUDITS ERROR: Web service invalid data");

		}
		else
		{
		   alert("GROUPS2AUDITS "+error);

		}
		 $("#progressMessage").html("Error updating GROUPS2AUDITS"+error);
			pbar.setValue(30);
		 
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
			 //("USERS2CERTS: "+itemcount);
			 
				 $("#progressMessage").html("AUDITQUESTS updated");
			pbar.setValue(85);

		 }

	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			alert("AUDITQUESTS ERROR: Web service invalid data");

		}
		else
		{
		   alert("AUDITQUESTS "+error);

		}
		 $("#progressMessage").html("Error updating AUDITQUESTS"+error);
			pbar.setValue(30);
		 
	 }
	 itemcount=0;
	 
	 try
	 {
		 if(newauditsdatatoinsert.Audits2SubParts!="")
		 {
			obj=jQuery.parseJSON(newauditsdatatoinsert.Audits2SubParts);
			$.each(obj, function (key, value) {
				query='INSERT INTO AUDITS2SUBPARTS (ID,SubPart) ("'+escapeDoubleQuotes(value.ID)+'", "'+escapeDoubleQuotes(value.SubPart)+'")';
				//alert(query);
				tx.executeSql(query);
				itemcount++;
			 });
				 $("#progressMessage").html("AUDITS2SUBPARTS updated");
			pbar.setValue(10);

		 }

	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			alert(" AUDITS2SUBPARTS ERROR: Web service invalid data");

		}
		else
		{
		   alert("AUDITS2SUBPARTS "+error);

		}
		 $("#progressMessage").html("Error updating AUDITS2SUBPARTS"+error);
			pbar.setValue(30);
		 
	 }

	 	$("#progressMessage").html("Audits completed updated");
		pbar.setValue(100);

		$("#progressMessage").html("");
		pbar.setValue(100);
		GetClientName();		
		
  //sendprocedures();	
}
//GET DATA FROM SERVER
function GetservicedataMessages(typesinc)
{
	var ipserver=$("#ipsync").val();
	synchours=typesinc;
	var obj = {};
		 if(!!sessionStorage.userid)
		 {
			 obj['UserID'] =sessionStorage.userid;
		 }
		 else
		 {
			 obj['UserID'] ="";
			 
		 }
	if(typesinc=="0")
	{
		$("#progressheader").html(" ");
	//progressheader
	$("#progressheader").html("Downloading data...");
		$("#progressMessage").html("Post To GetMessages");
		pbar.setValue(0);
		//alert("listo para el post: "+ipserver+'//GetStructureData');
	                $.ajax({
                    type: 'POST',
                    //url: 'http://dc4life78-001-site6.dtempurl.com/ServiceFt.asmx//GetStructureData',
				    url:ipserver+'//GetMessages',
					data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						//alert(response.d);
						//alert("WEb service works");
						InsertDatabaseMessages(response.d);
                        //alert(response.d.users);
                       // var obj = jQuery.parseJSON(response.d.users);
                       // $.each(obj, function (key, value) {
                         //   alert(value.Username);//inserts users
                        //});
                       // $('#lblData').html(JSON.stringify());
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
							$("#progressheader").html("Can not connect to server");
							$("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
					IsSyncMessages=false;		
					setTimeout( function(){ $("#generic-dialog").dialog("close"); }, 10000 );
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                   // alert("Error");
                }
                });
		
	}
	else
	{
		
	}	
	
}

function InsertDatabaseMessages(newdatabase)
{

	$("#progressMessage").html("Successful connection");
		pbar.setValue(1);
	newmessagesdatatoinsert=newdatabase;
	//alert(newdatabase);
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytoinsertMessages, errorCB);
	
}

function QuerytoinsertMessages(tx)
{
	//alert("deleteoldrecords");
	//alert("Insert new data GetMessages");
	$("#progressMessage").html("Deleting old records");
		pbar.setValue(2);
	var idusera=sessionStorage.userid;		
	if(!!sessionStorage.userid)
	{
		//alert("Deleting "+idusera);
		tx.executeSql("DELETE FROM MESSAGES WHERE UserIDTO='"+idusera+"' AND SentFT='no'");
		tx.executeSql("DELETE FROM MESSAGES WHERE UserIDFrom='"+idusera+"' AND SentFT='no'");
	}
	//ready to insert new records
	//alert("Insert new data MESSAGES");
	$("#progressMessage").html("Ready to insert new records");
	var query;
	var obj;
	//alert("Items "+obj.length);
	var itemcount=0;
	 try
	 {
	 	obj = jQuery.parseJSON(newmessagesdatatoinsert.Messages);
    	$.each(obj, function (key, value) {
	//alert('INSERT INTO MESSAGES (ID,UserIDTo,UserIDFrom,Status,Date,Title,Category,Message,Priority,UserToList,Sync) VALUES ("'+escapeDoubleQuotes(value.ID)+'", "'+escapeDoubleQuotes(value.UserIDTo)+'", "'+escapeDoubleQuotes(value.UserIDFrom)+'", "'+escapeDoubleQuotes(value.Status)+'", "'+value.Date+'", "'+escapeDoubleQuotes(value.Title)+'", "'+escapeDoubleQuotes(value.Category)+'", "'+escapeDoubleQuotes(value.Message)+'", "'+escapeDoubleQuotes(value.Priority)+'", "'+escapeDoubleQuotes(value.UserToList)+'","yes")');
		query='INSERT INTO MESSAGES (ID,UserIDTo,UserIDFrom,Status,Date,Title,Category,Message,Priority,UserToList,UserIDToName,UserIDFromName,Sync,SentFT) VALUES ("'+escapeDoubleQuotes(value.ID)+'", "'+escapeDoubleQuotes(value.UserIDTo)+'", "'+escapeDoubleQuotes(value.UserIDFrom)+'", "'+escapeDoubleQuotes(value.Status)+'", "'+value.Date+'", "'+escapeDoubleQuotes(value.Title)+'", "'+escapeDoubleQuotes(value.Category)+'", "'+escapeDoubleQuotes(value.Message)+'", "'+escapeDoubleQuotes(value.Priority)+'", "'+escapeDoubleQuotes(value.UserToList)+'","'+escapeDoubleQuotes(value.UserIDToName)+'","'+escapeDoubleQuotes(value.UserIDFromName)+'","yes","no")';
		//alert(query);
		tx.executeSql(query);
		itemcount++;
     });
	// alert("Messages: "+itemcount);
	 
	 	$("#progressMessage").html("Messages updated");
	pbar.setValue(10);
	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			alert(" MESSAGES ERROR: Web service invalid data");

		}
		else
		{
		   alert("MESSAGES " +error);

		}
		 $("#progressMessage").html("Error updating Messages "+error);
			pbar.setValue(30);
		 
	 }
	 
	
		 
	 $("#progressMessage").html("Messages updated");
		pbar.setValue(100);

	$("#progressMessage").html("");
		pbar.setValue(100);

	    GetserviceAudits();	

		

   //sendprocedures();	
}

//GET DATA FROM SERVER
function GetservicedataSubmitHours(typesinc)
{
	var ipserver=$("#ipsync").val();
	synchours=typesinc;
	//alert("synchours= "+synchours);
	if(typesinc=="0")
	{
		$("#progressheader").html(" ");
	//progressheader
	
	$("#progressheader").html("Downloading data...");
		$("#progressMessage").html("Post To GetSubmittedHours");
		pbar.setValue(0);
		 var obj = {};
		 if(!!sessionStorage.userid)
		 {
			 obj['UserID'] =sessionStorage.userid;
		 }
		 else
		 {
			 obj['UserID'] ="";
			 
		 }
         
		// alert(obj['UserID']+" userid");
		//alert("listo para el post: "+ipserver+'//GetStructureData');
	                $.ajax({
                    type: 'POST',
                    //url: 'http://dc4life78-001-site6.dtempurl.com/ServiceFt.asmx//GetStructureData',
				    url:ipserver+'//GetSubmittedHours',
					data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						//alert(response.d);
						//alert("WEb service works");
						$("#progressMessage").html("GetSubmittedHours success");
						InsertDatabaseSubmitHours(response.d);
                        //alert(response.d.users);
                        //var obj = jQuery.parseJSON(response.d.SubmittedHours);
                        //$.each(obj, function (key, value) {
                          // alert(value.SubmitID);//inserts users
                        //});
                       // $('#lblData').html(JSON.stringify());
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
							$("#progressheader").html("Can not connect to server");
							$("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
					IsSyncMessages=false;		
					setTimeout( function(){ $("#generic-dialog").dialog("close"); }, 6000 );
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                   // alert("Error");
                }
                });
		
	}
	else
	{
		
	}	
	
}

function InsertDatabaseSubmitHours(newdatabase)
{
   // alert("Enter To insert DAta Submitted");
	$("#progressMessage").html("Successful connection");
		pbar.setValue(1);
	newhoursdatatoinsert=newdatabase;
	//alert(newdatabase);
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytoinsertSubmitHours, errorCB);
	
}

function QuerytoinsertSubmitHours(tx)
{
	//alert("deleteoldrecords SubmittedHours");
	$("#progressMessage").html("Deleting old records");
		pbar.setValue(2);
	var idusera=sessionStorage.userid;	
	if(!!sessionStorage.userid)
	{
		//alert("Deleting "+idusera);
		tx.executeSql("DELETE FROM SUBMITTEDHOURS WHERE UserID='"+idusera+"'");
	}	
	//alert("Insert new data GetSubmittedHours");
	//ready to insert new records
	//alert("Insert new data SubmittedHours");
	$("#progressMessage").html("Ready to insert new records");
	var query;
	//alert("newhoursvar "+newhoursdatatoinsert);
	var obj;
	//alert(obj);
	//alert("Itemssdsdsdsdsd "+obj.length);
	var itemcount=0;
	 try
	 {
	obj = jQuery.parseJSON(newhoursdatatoinsert.SubmittedHours);
    $.each(obj, function (key, value) {
		//alert('INSERT INTO USERS (Username,Password,FirstName,LastName,LevelNum) VALUES ("'+value.Username+'", "'+value.Password+'","'+value.FirstName+'","'+value.LastName+'","'+value.LevelNum+'")');
		query='INSERT INTO SUBMITTEDHOURS (SubmitID,UserID,Type,Status,SubmitDate,EntryDate,Task,LevelNum,Item,Hours,Mins,PersonnelID,SupervisorID,RejectReason,ReviewDate,Sync) VALUES ("'+escapeDoubleQuotes(value.SubmitID)+'", "'+escapeDoubleQuotes(value.UserID)+'", "'+escapeDoubleQuotes(value.Type)+'", "'+escapeDoubleQuotes(value.Status)+'", "'+value.SubmitDate+'", "'+value.EntryDate+'", "'+escapeDoubleQuotes(value.Task)+'", "'+value.LevelNum+'", "'+escapeDoubleQuotes(value.Item)+'", "'+value.Hours+'", "'+value.Mins+'", "'+value.PersonnelID+'", "'+value.SupervisorID+'", "'+value.RejectReason+'", "'+value.ReviewDate+'","yes")';
		tx.executeSql(query);
		itemcount++;
     });
	// alert("totalSubmittedHours: "+itemcount);
	 
	 	$("#progressMessage").html("SubmittedHours updated");
	pbar.setValue(10);
	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			alert("SUBMITTEDHOURS ERROR: Web service invalid data");

		}
		else
		{
		   alert("SUBMITTEDHOURS "+error);

		}
		 $("#progressMessage").html("Error updating SubmittedHours "+error);
			pbar.setValue(30);
		 
	 }
	 
	
		 
	 $("#progressMessage").html("SubmittedHours updated");
		pbar.setValue(100);

	$("#progressMessage").html("");
		pbar.setValue(100);
		//Getservicedata();
		GetservicedataMessages(0);
	//if(synchours=="0")
	//{
	//  GetservicedataMessages(0);		
	//}
	//else
	//{
		
	//}
		

   //sendprocedures();	
}

//GET DATA FROM SERVER
function GetservicedataCourses()
{	
	var ipserver=$("#ipsync").val();
	//alert("Get Courses");
    //alert("Get Data from:"+ipserver);
	//alert("Post To GetCoursesdata");
$("#progressheader").html(" ");
	//progressheader
	$("#progressheader").html("Downloading data...");
		$("#progressMessage").html("Post To GetCoursesdata");
		pbar.setValue(0);
		//alert("listo para el post: "+ipserver+'//GetStructureData');
	                $.ajax({
                    type: 'POST',
                    //url: 'http://dc4life78-001-site6.dtempurl.com/ServiceFt.asmx//GetStructureData',
				    url:ipserver+'//GetCoursesdata',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						//alert(response.d);
						//alert("WEb service works");
						InsertDatabaseCourses(response.d);
                        //alert(response.d.users);
                       // var obj = jQuery.parseJSON(response.d.users);
                       // $.each(obj, function (key, value) {
                         //   alert(value.Username);//inserts users
                        //});
                       // $('#lblData').html(JSON.stringify());
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
							$("#progressheader").html("Can not connect to server");
							$("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
					IsSyncMessages=false;		
					setTimeout( function(){ $("#generic-dialog").dialog("close"); }, 6000 );
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                   // alert("Error");
                }
                });
				//alert("primer post ejecutado");
}

function InsertDatabaseCourses(newdatabase)
{

	$("#progressMessage").html("Successful connection");
		pbar.setValue(1);
	newcoursesdatatoinsert=newdatabase;
	//alert(newdatabase);
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytoinsertCourses, errorCB);
	
}

function QuerytoinsertCourses(tx)
{
	//alert("deleteoldrecords");
	$("#progressMessage").html("Deleting old records");
		pbar.setValue(2);
	tx.executeSql("DELETE FROM COURSES");
	//ready to insert new records
	//alert("Insert new data GetCoursesdata");
	$("#progressMessage").html("Ready to insert new records");
	var query;
	var obj;
	//alert("Items "+obj.length);
	var itemcount=0;
	 try
	 {
	obj = jQuery.parseJSON(newcoursesdatatoinsert.Courses);
    $.each(obj, function (key, value) {
		//alert('INSERT INTO USERS (Username,Password,FirstName,LastName,LevelNum) VALUES ("'+value.Username+'", "'+value.Password+'","'+value.FirstName+'","'+value.LastName+'","'+value.LevelNum+'")');
		query='INSERT INTO COURSES (ID,Description,DescriptionLang2,ContentType,DurationHours,DurationMins,Scope,Instructor,FileName) VALUES ("'+escapeDoubleQuotes(value.ID)+'", "'+escapeDoubleQuotes(value.Description)+'", "'+escapeDoubleQuotes(value.DescriptionLang2)+'", "'+value.ContentType+'", "'+value.DurationHours+'", "'+value.DurationMins+'", "'+value.Scope+'", "'+escapeDoubleQuotes(value.Instructor)+'","'+escapeDoubleQuotes(value.FileName)+'")';
		//alert(query);
		tx.executeSql(query);
		itemcount++;
     });
	// alert("totalGroups2content: "+itemcount);
	 
	 	$("#progressMessage").html("Courses updated");
	pbar.setValue(10);
	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			alert("COURSES ERROR: Web service invalid data");

		}
		else
		{
		   alert("COURSES "+ error);

		}
		 $("#progressMessage").html("Error updating Courses "+error);
			pbar.setValue(30);
		 
	 }
	 
	
		 
	 $("#progressMessage").html("Courses updated");
		pbar.setValue(100);

	$("#progressMessage").html("");
		pbar.setValue(100);
    //GetservicedataSubmitHours(0);
	GetservicedataSubmitHours(0);
	//Getservicedata();	
}
function GetservicedataTimeTracking()
{	
	var ipserver=$("#ipsync").val();
	//alert("Get Courses");
    //alert("Get Data from:"+ipserver);
	//alert("Post To GetCoursesdata");
$("#progressheader").html(" ");
	//progressheader
	$("#progressheader").html("Downloading data...");
		$("#progressMessage").html("Post To GetTimeTracking");
		pbar.setValue(0);
		//alert("listo para el post: "+ipserver+'//GetStructureData');
	                $.ajax({
                    type: 'POST',
				    url:ipserver+'//GetTimeTracking',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						//alert(response.d);
						//alert("WEb service works");
						InsertDatabaseTimeTracking(response.d);
                        //alert(response.d.users);
                       // var obj = jQuery.parseJSON(response.d.users);
                       // $.each(obj, function (key, value) {
                         //   alert(value.Username);//inserts users
                        //});
                       // $('#lblData').html(JSON.stringify());
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
							$("#progressheader").html("Can not connect to server");
							$("#progressMessage").html("Error Getting data Timetracking:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
					IsSyncMessages=false;		
					setTimeout( function(){ $("#generic-dialog").dialog("close"); }, 6000 );
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                   // alert("Error");
                }
                });
				//alert("primer post ejecutado");
}

function InsertDatabaseTimeTracking(newdatabase)
{

	$("#progressMessage").html("Successful connection");
		pbar.setValue(1);
		newtimetrackingtoinsert=newdatabase;
	//alert(newdatabase);
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytoinsertTimeTracking, errorCB);
	
}

function QuerytoinsertTimeTracking(tx)
{
	//alert("deleteoldrecords");
	$("#progressMessage").html("Deleting old records");
		pbar.setValue(2);
	tx.executeSql("DELETE FROM TIMETRACKING");
	//ready to insert new records
	//alert("Insert new data GetCoursesdata");
	$("#progressMessage").html("Ready to insert new records");
	var query;
	var obj;
	//alert("Items "+obj.length);
	var itemcount=0;
	 try
	 {
	obj = jQuery.parseJSON(newtimetrackingtoinsert.TimeTracking);
    $.each(obj, function (key, value) {
		//alert('INSERT INTO USERS (Username,Password,FirstName,LastName,LevelNum) VALUES ("'+value.Username+'", "'+value.Password+'","'+value.FirstName+'","'+value.LastName+'","'+value.LevelNum+'")');
		query='INSERT INTO TIMETRACKING  (UserID,ContentID,TotalTime,Date,ClassID) VALUES ("'+escapeDoubleQuotes(value.UserID)+'", "'+escapeDoubleQuotes(value.ContentID)+'", "'+value.TotalTime+'", "'+value.Date+'", "'+escapeDoubleQuotes(value.ClassID)+'")';
		//alert(query);
		tx.executeSql(query);
		itemcount++;
     });
	// alert("totalGroups2content: "+itemcount);
	 
	 	$("#progressMessage").html("TimeTracking updated");
	pbar.setValue(10);
	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			alert("TIMETRACKING ERROR: Web service invalid data");

		}
		else
		{
		   alert("TIMETRACKING "+error);

		}
		 $("#progressMessage").html("Error updating TimeTracking "+error);
			pbar.setValue(30);
		 
	 }
	 
	
		 
	 $("#progressMessage").html("TimeTracking updated");
		pbar.setValue(100);

	$("#progressMessage").html("");
		pbar.setValue(100);
		GetservicedataCourses();
}
//GET DATA FROM SERVER

function GetservicedataGroups()
{	
	var ipserver=$("#ipsync").val();
    //alert("Get Data from:"+ipserver);
	//alert("");
$("#progressheader").html(" ");
	//progressheader
	$("#progressheader").html("Downloading data...");
		$("#progressMessage").html("Post To GetGroupsData");
		pbar.setValue(0);
		//alert("listo para el post: "+ipserver+'//GetStructureData');
	                $.ajax({
                    type: 'POST',
                    //url: 'http://dc4life78-001-site6.dtempurl.com/ServiceFt.asmx//GetStructureData',
				    url:ipserver+'//GetGroupsData',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						//alert(response.d);
						//alert("WEb service works");
						InsertDatabaseGroups(response.d);
                        //alert(response.d.users);
                       // var obj = jQuery.parseJSON(response.d.users);
                       // $.each(obj, function (key, value) {
                         //   alert(value.Username);//inserts users
                        //});
                       // $('#lblData').html(JSON.stringify());
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
							$("#progressheader").html("Can not connect to server");
							$("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
					IsSyncMessages=false;		
					setTimeout( function(){ $("#generic-dialog").dialog("close"); }, 6000 );
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                   // alert("Error");
                }
                });
				//alert("primer post ejecutado");
}

function InsertDatabaseGroups(newdatabase)
{

	$("#progressMessage").html("Successful connection");
		pbar.setValue(1);
	newgroupsdatatoinsert=newdatabase;
	//alert(newdatabase);
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytoinsertGroups, errorCB);
	
}

function QuerytoinsertGroups(tx)
{
	//alert("deleteoldrecords");
	$("#progressMessage").html("Deleting old records");
		pbar.setValue(2);
	tx.executeSql("DELETE FROM GROUP2SUPS");
	tx.executeSql("DELETE FROM GROUP2SUPSRTI");
	tx.executeSql("DELETE FROM GROUPS2CONTENT");
	tx.executeSql("DELETE FROM CATEGORIES");
	//ready to insert new records
	//alert("Insert new data GetGroupsData");
	$("#progressMessage").html("Ready to insert new records");
	var query;
	var obj;
	//alert("Items "+obj.length);
	var itemcount=0;
		 try
	 {
	obj = jQuery.parseJSON(newgroupsdatatoinsert.Categories);
    $.each(obj, function (key, value) {
		//alert('INSERT INTO USERS (Username,Password,FirstName,LastName,LevelNum) VALUES ("'+value.Username+'", "'+value.Password+'","'+value.FirstName+'","'+value.LastName+'","'+value.LevelNum+'")');
		//alert('INSERT INTO CATEGORIES (Name) VALUES ("'+value.Name+'")');
		query='INSERT INTO CATEGORIES (Name) VALUES ("'+value.Name+'")';
		tx.executeSql(query);
		itemcount++;
     });
	// alert("totalGroups2content: "+itemcount);
	 
	 	$("#progressMessage").html("Categories updated");
	pbar.setValue(10);
	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			alert(" CATEGORIES ERROR: Web service invalid data");

		}
		else
		{
		   alert("CATEGORIES"+ error);

		}
		 $("#progressMessage").html("Error updating Categories "+error);
			pbar.setValue(30);
		 
	 }
	 itemcount=0;
	 try
	 {
	obj=jQuery.parseJSON(newgroupsdatatoinsert.Groups2Content);
    $.each(obj, function (key, value) {
		//alert('INSERT INTO USERS (Username,Password,FirstName,LastName,LevelNum) VALUES ("'+value.Username+'", "'+value.Password+'","'+value.FirstName+'","'+value.LastName+'","'+value.LevelNum+'")');
		query='INSERT INTO GROUPS2CONTENT (GroupID,ID,Ord) VALUES ("'+escapeDoubleQuotes(value.GroupID)+'", "'+escapeDoubleQuotes(value.ID)+'","'+escapeDoubleQuotes(value.Ord)+'")';
		//alert(query);
		tx.executeSql(query);
		itemcount++;
     });
	// alert("totalGroups2content: "+itemcount);
	 
	 	$("#progressMessage").html("Groups2Content updated");
	pbar.setValue(10);
	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			alert("GROUPS2CONTENT ERROR: Web service invalid data");

		}
		else
		{
		   alert("GROUPS2CONTENT "+error);

		}
		 $("#progressMessage").html("Error updating Groups2Content "+error);
			pbar.setValue(30);
		 
	 }
	 
	 try
	 {
		 	 obj=jQuery.parseJSON(newgroupsdatatoinsert.Groups2Sups);
			 //alert("Groups:"+obj.length);
	     $.each(obj, function (key, value) {
		query='INSERT INTO GROUP2SUPS (GroupID,ID) VALUES ("'+value.GroupID+'","'+value.ID+'")';
		tx.executeSql(query);
		 $("#progressMessage").html("Group2Sups updated");
	pbar.setValue(20);
     });
		 
	 }
	 catch(error)
	 {
		  $("#progressMessage").html("Error updating Group2Sups"+error);
			pbar.setValue(20);
		 
	 }
	   
	  
	  try
	 {
	  obj=jQuery.parseJSON(newgroupsdatatoinsert.Groups2SupsRTI);
	  	 //alert("User2Groups:"+obj.length);
	     $.each(obj, function (key, value) {
		
		query='INSERT INTO GROUP2SUPSRTI (GroupID,ID) VALUES ("'+value.UserID+'","'+value.ID+'")';
		tx.executeSql(query);
     });
	 
	$("#progressMessage").html("Group2supsRTI updated");
	pbar.setValue(60);
	 }
	 	 catch(error)
	 {
		 
		  $("#progressMessage").html("Error updating Group2supsRTI"+error);
			pbar.setValue(60);
		 
	 }
    // alert("Groups UPDATED");
		 
	 $("#progressMessage").html("Groups updated");
		pbar.setValue(100);

	$("#progressMessage").html("");
		pbar.setValue(100);
		GetservicedataTimeTracking();
   //sendprocedures();	
}




//GET DATA FROM SERVER TASKS
function GetservicedataTasks()
{
	
	
	var ipserver=$("#ipsync").val();
$("#progressheader").html(" ");
	//progressheader
	$("#progressheader").html("Downloading data...");
		$("#progressMessage").html("Post To GetTaskData");
		pbar.setValue(0);
		//alert("listo para el post: "+ipserver+'//GetStructureData');
	                $.ajax({
                    type: 'POST',
                    //url: 'http://dc4life78-001-site6.dtempurl.com/ServiceFt.asmx//GetStructureData',
				    url:ipserver+'//GetTasksData',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						//alert(response.d);
						//alert("WEb service works");
						InsertDatabaseTasks(response.d);
                        //alert(response.d.users);
                       // var obj = jQuery.parseJSON(response.d.users);
                       // $.each(obj, function (key, value) {
                         //   alert(value.Username);//inserts users
                        //});
                       // $('#lblData').html(JSON.stringify());
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
							$("#progressheader").html("Can not connect to server");
							$("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
					IsSyncMessages=false;		
				    setTimeout( function(){ $("#generic-dialog").dialog("close"); }, 6000 );
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                   // alert("Error");
                }
                });
				//alert("primer post ejecutado");
}

function InsertDatabaseTasks(newdatabase)
{

	$("#progressMessage").html("Successful connection");
		pbar.setValue(1);
	newtasksdatatoinsert=newdatabase;
	//alert(newdatabase);
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytoinsertTasks, errorCB);
	
}

function QuerytoinsertTasks(tx)
{
	//alert("deleteoldrecords");
	$("#progressMessage").html("Deleting old records");
		pbar.setValue(2);
	tx.executeSql("DELETE FROM ITEMS");
	tx.executeSql("DELETE FROM LEVELS2ITEMS");
	tx.executeSql("DELETE FROM DUTIES2TASKS");
	tx.executeSql("DELETE FROM TASKS");
	tx.executeSql("DELETE FROM LEVELS");
	//ready to insert new records
	//alert("Insert new data GetTaskData");
	$("#progressMessage").html("Ready to insert new records");
	var query;
	var obj;
	//alert("Items "+obj.length);
	var itemcount=0;
	 try
	 {
	obj = jQuery.parseJSON(newtasksdatatoinsert.Items);
    $.each(obj, function (key, value) {
		//alert('INSERT INTO USERS (Username,Password,FirstName,LastName,LevelNum) VALUES ("'+value.Username+'", "'+value.Password+'","'+value.FirstName+'","'+value.LastName+'","'+value.LevelNum+'")');
		query='INSERT INTO ITEMS (ID,Item,Location,RTISup,CourseID) VALUES ("'+escapeDoubleQuotes(value.ID)+'", "'+escapeDoubleQuotes(value.Item)+'","'+escapeDoubleQuotes(value.Location)+'","'+escapeDoubleQuotes(value.RTISup)+'","'+escapeDoubleQuotes(value.CourseID)+'")';
		tx.executeSql(query);
		itemcount++;
     });
	 //alert("totalusers:"+usercount);
	 
	 	$("#progressMessage").html("Items updated");
	pbar.setValue(10);
	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			alert("ITEMS ERROR: Web service invalid data");

		}
		else
		{
		   alert("ITEMS "+error);

		}
		 $("#progressMessage").html("Error updating Items "+error);
			pbar.setValue(30);
		 
	 }
	 
	 try
	 {
		 	 obj=jQuery.parseJSON(newtasksdatatoinsert.Levels2Items);
			 //alert("Groups:"+obj.length);
	     $.each(obj, function (key, value) {
		query='INSERT INTO LEVELS2ITEMS (LevelNum,ID,Location) VALUES ("'+value.LevelNum+'","'+escapeDoubleQuotes(value.ID)+'","'+escapeDoubleQuotes(value.Location)+'")';
		tx.executeSql(query);
		 $("#progressMessage").html("Levels2Items updated");
	pbar.setValue(20);
     });
		 
	 }
	 catch(error)
	 {
		  $("#progressMessage").html("Error updating Levels2Items "+error);
			pbar.setValue(20);
		 
	 }

	 try
	 {
	  obj=jQuery.parseJSON(newtasksdatatoinsert.Duties);
	     $.each(obj, function (key, value) {
		
		query='INSERT INTO DUTIES (Duty,Location) VALUES ("'+escapeDoubleQuotes(value.Duty)+'","'+escapeDoubleQuotes(value.Location)+'")';
		//alert(query);
		tx.executeSql(query);
     });
	 
	$("#progressMessage").html("Duties updated");
	pbar.setValue(60);
	 }
	 	 catch(error)
	 {
		 
		  $("#progressMessage").html("Error updating Duties "+error);
			pbar.setValue(60);
		 
	 }
	   
	  
	  try
	 {
	  obj=jQuery.parseJSON(newtasksdatatoinsert.Duties2Tasks);
	  	 //alert("Duties2Tasks:"+obj.length);
	     $.each(obj, function (key, value) {
		
		query='INSERT INTO DUTIES2TASKS (Duty,TaskID,OrdNum,Location) VALUES ("'+escapeDoubleQuotes(value.Duty)+'","'+escapeDoubleQuotes(value.TaskID)+'","'+value.OrdNum+'","'+escapeDoubleQuotes(value.Location)+'")';
		//alert(query);
		tx.executeSql(query);
     });
	 
	$("#progressMessage").html("Duties2Tasks updated");
	pbar.setValue(60);
	 }
	 	 catch(error)
	 {
		 
		  $("#progressMessage").html("Error updating Duties2Tasks "+error);
			pbar.setValue(60);
		 
	 }
	 
	 	  try
	 {
	  obj=jQuery.parseJSON(newtasksdatatoinsert.Tasks);
	  	 //alert("Duties2Tasks:"+obj.length);
	     $.each(obj, function (key, value) {
		
		query='INSERT INTO TASKS (ID,Name,ReqHrsOJT,Location) VALUES ("'+escapeDoubleQuotes(value.ID)+'","'+escapeDoubleQuotes(value.Name)+'","'+value.ReqHrsOJT+'","'+escapeDoubleQuotes(value.Location)+'")';
		//alert(query);
		tx.executeSql(query);
     });
	 
	$("#progressMessage").html("TASKS updated");
	pbar.setValue(60);
	 }
	 	 catch(error)
	 {
		 
		  $("#progressMessage").html("Error updating TASKS "+error);
			pbar.setValue(60);
		 
	 }
	 
	   try
	 {
	  obj=jQuery.parseJSON(newtasksdatatoinsert.Levels);
	  	 //alert("Duties2Tasks:"+obj.length);
	     $.each(obj, function (key, value) {
		
		query='INSERT INTO LEVELS (LevelNum,ReqMonths,ReqHrsRTI,ReqHrsOJT,Location) VALUES ("'+value.LevelNum+'","'+value.Months+'","'+value.ReqHrsRTI+'","'+value.ReqHrsOJT+'","'+escapeDoubleQuotes(value.Location)+'")';
		//alert(query);
		tx.executeSql(query);
     });
	 
	$("#progressMessage").html("Levels updated");
	pbar.setValue(60);
	 }
	 	 catch(error)
	 {
		 
		  $("#progressMessage").html("Error updating Levels"+error);
			pbar.setValue(60);
		 
	 }

		 
	 $("#progressMessage").html("Tasks updated");
		pbar.setValue(100);

	$("#progressMessage").html("");
		pbar.setValue(100);
    GetservicedataGroups();
   //sendprocedures();	
}

//Get DATA FROM FIRST SYNC
function Getservicedata()
{
	//alert("old Sync");
	
	var ipserver=$("#ipsync").val();
    //alert("Get Data from:"+ipserver);
	//alert("");
$("#progressheader").html(" ");
	//progressheader
	$("#progressheader").html("Downloading data...");
		$("#progressMessage").html("Post To GetStructureData");
		pbar.setValue(0);
		//alert("listo para el post: "+ipserver+'//GetStructureData');
	                $.ajax({
                    type: 'POST',
                    //url: 'http://dc4life78-001-site6.dtempurl.com/ServiceFt.asmx//GetStructureData',
				    url:ipserver+'//GetStructureData',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						//alert(response.d);
						//alert("WEb service works");
						InsertDatabase(response.d);
                        //alert(response.d.users);
                       // var obj = jQuery.parseJSON(response.d.users);
                       // $.each(obj, function (key, value) {
                         //   alert(value.Username);//inserts users
                        //});
                       // $('#lblData').html(JSON.stringify());
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
				            IsSyncMessages=false;
							$("#progressheader").html("Can not connect to server");
							$("#progressMessage").html("ERROR Downloading Data:"+xmlHttpRequest.responseXML+" Status: "+textStatus+" thrown: "+errorThrown);
							setTimeout( function(){ $("#generic-dialog").dialog("close"); }, 6000 );
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                   // alert("Error");
                }
                });
				//alert("primer post ejecutado");
}

function InsertDatabase(newdatabase)
{

	$("#progressMessage").html("Successful connection");
		pbar.setValue(1);
	newdatabasetoinsert=newdatabase;
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(Querytoinsertusers, errorCB);
	
}

function Querytoinsertusers(tx)
{
	//alert("Insert new data GetStructureData");
	//alert("deleteoldrecords");
	$("#progressMessage").html("Deleting old records");
		pbar.setValue(2);
	tx.executeSql("DELETE FROM USERS");
	tx.executeSql("DELETE FROM GROUPS");
	tx.executeSql("DELETE FROM USERS2GROUPS");
	tx.executeSql("DELETE FROM CHECKLISTS");
	tx.executeSql("DELETE FROM MODULES2CHECKLISTS");
	tx.executeSql("DELETE FROM GROUPS2PROCEDURES");
	tx.executeSql("DELETE FROM PROCEDURES");
	tx.executeSql("DELETE FROM PROCEDURESTEPS");
	tx.executeSql("DELETE FROM COMPONENTS");
	tx.executeSql("DELETE FROM COMPS2FAULTS");
	tx.executeSql("DELETE FROM FAULTS");
	tx.executeSql("DELETE FROM REJECTED");
	tx.executeSql("DELETE FROM UserSettings");
	//ready to insert new records
	//alert("Insert new data");
	$("#progressMessage").html("Ready to insert new records");
	var query;
	var obj = jQuery.parseJSON(newdatabasetoinsert.users);
	//alert("users:"+obj.length);
	var usercount=0;
	 try
	 {
    $.each(obj, function (key, value) {
		//alert('INSERT INTO USERS (Username,Password,FirstName,LastName,LevelNum) VALUES ("'+value.Username+'", "'+value.Password+'","'+value.FirstName+'","'+value.LastName+'","'+value.LevelNum+'")');
		query='INSERT INTO USERS (Username,Password,FirstName,LastName,LevelNum,LevelType,Location,Supervisor,AltLevel) VALUES ("'+value.Username+'", "'+value.Password+'","'+value.FirstName+'","'+value.LastName+'","'+value.LevelNum+'","'+value.LevelType+'","'+escapeDoubleQuotes(value.Location)+'","'+value.Supervisor+'","'+value.AltLevel+'")';
		tx.executeSql(query);
		usercount++;
     });
	 //alert("totalusers:"+usercount);
	 
	 	$("#progressMessage").html("Users updated");
	pbar.setValue(10);
	 }
	 catch(error)
	 {
		 alert(error);
		 $("#progressMessage").html("Error updating Users "+error);
			pbar.setValue(10);
		 
	 }
	 
	 try
	 {
		 	 obj=jQuery.parseJSON(newdatabasetoinsert.groups);
			 //alert("Groups:"+obj.length);
	     $.each(obj, function (key, value) {
		query='INSERT INTO GROUPS (AreaID,GroupID,Description,Location) VALUES ("'+value.AreaID+'","'+value.GroupID+'","'+escapeDoubleQuotes(value.Description)+'","'+escapeDoubleQuotes(value.Location)+'")';
		tx.executeSql(query);
		 $("#progressMessage").html("Groups updated");
	pbar.setValue(20);
     });
		 
	 }
	 catch(error)
	 {
		  $("#progressMessage").html("Error updating Groups "+error);
			pbar.setValue(20);
		 
	 }
	 
	 
	 
	
	  
	  
	  
	  try
	 {
	  obj=jQuery.parseJSON(newdatabasetoinsert.users2groups);
	  	 //alert("User2Groups:"+obj.length);
	     $.each(obj, function (key, value) {
		
		query='INSERT INTO USERS2GROUPS (UserID,ID) VALUES ("'+value.UserID+'","'+value.ID+'")';
		tx.executeSql(query);
     });
	 
	$("#progressMessage").html("Users2groups updated");
	pbar.setValue(30);
	 }
	 	 catch(error)
	 {
		 
		  $("#progressMessage").html("Error updating Users2groups "+error);
			pbar.setValue(30);
		 
	 }
	  
	 
	   try
	 {
	 	  obj=jQuery.parseJSON(newdatabasetoinsert.checklists);
		   //alert("CHECKLISTS:"+obj.length);
	     $.each(obj, function (key, value) {
			
		query='INSERT INTO CHECKLISTS (ID,DESCRIPTION,TYPE) VALUES ("'+value.ID+'","'+escapeDoubleQuotes(value.Description)+'","'+value.Type+'")';
		tx.executeSql(query);
     });
	 
	  $("#progressMessage").html("Checklists updated");
	pbar.setValue(40);
	 }
	  	 catch(error)
	 {
		 
		  $("#progressMessage").html("Error updating Checklists "+error);
			pbar.setValue(40);
		 
	 }
	 
	 
	 
   //modules2checklists
   
    try
	 {
   obj=jQuery.parseJSON(newdatabasetoinsert.modules2checklists);
    //alert("MODULES2CHECKLISTS:"+obj.length);
	     $.each(obj, function (key, value) {
		query='INSERT INTO MODULES2CHECKLISTS (ModuleID,ID) VALUES ("'+value.ModuleID+'","'+value.ID+'")';
		tx.executeSql(query);
     });
	 
	 $("#progressMessage").html("Modules2checklists updated");
	pbar.setValue(50);
	 }
	   	 catch(error)
	 {
		 $("#progressMessage").html("Error updating Modules2checklists "+error);
			pbar.setValue(50);
		 
		 
	 }
	 

   
   //groups2procedures
   try
	 {
        obj=jQuery.parseJSON(newdatabasetoinsert.groups2procedures);
		//alert("GROUPS2PROCEDURES:"+obj.length);
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
		query='INSERT INTO GROUPS2PROCEDURES (GroupID,ID,Ord,Location) VALUES ("'+value.GroupID+'","'+value.ID+'","'+value.Ord+'","'+locacion+'")';
		//alert(query);
		tx.executeSql(query);
     });
	 $("#progressMessage").html("Groups2procedures updated");
	pbar.setValue(60);
	 }
	   	 catch(error)
	 {
		  $("#progressMessage").html("Error updating Groups2procedures "+error);
			pbar.setValue(60);
		 
	 }
   //procedures
   
   try
	 {
           obj=jQuery.parseJSON(newdatabasetoinsert.procedures);
		   //alert("PROCEDURES:"+obj.length);
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
		query='INSERT INTO PROCEDURES (ProcID,Name,type,Freq,Location) VALUES ("'+value.ProcID+'", "'+escapeDoubleQuotes(value.Name)+'", "'+value.Type+'", "'+value.Freq+'","'+locacion+'")';
		//alert(query);
		tx.executeSql(query);
     });
	 
	 $("#progressMessage").html("Procedures updated");
	 pbar.setValue(70);
	 }
	    	 catch(error)
	 {
		  $("#progressMessage").html("Error updating Procedures "+error);
			pbar.setValue(70);
		 
		 
	 }
	  
   
   
   //proceduresteps
   try
	 {
    obj=jQuery.parseJSON(newdatabasetoinsert.proceduresteps);
	//alert("PROCEDURESTEPS:"+obj.length);
	//alert("insert proceduresteps");
	// tt=0;
	     $.each(obj, function (key, value) { 
		// tt=tt+1;
		
		query='INSERT INTO PROCEDURESTEPS (ProcID,StepID,OrdNum ,Text,Type,Num,SelAllComps,SelAllFaults) VALUES ("'+value.ProcID+'", "'+value.StepID+'", "'+value.OrdNum+'", "'+escapeDoubleQuotes(value.Text)+'", "'+value.Type+'", "'+value.Num+'", "'+value.SelAllComps+'", "'+value.SelAllFaults+'")';
		//alert(query);
		tx.executeSql(query);
		
     });
	 
	 $("#progressMessage").html("Procedures Steps updated");
	pbar.setValue(80);
	 }
	     	 catch(error)
	 {
		  $("#progressMessage").html("Error updating Procedures Steps "+error);
			pbar.setValue(80);
		 
	 }
	  
   
   //components
   
   try
   {
      obj=jQuery.parseJSON(newdatabasetoinsert.components);
	     $.each(obj, function (key, value) {
		query='INSERT INTO COMPONENTS (ID,Component,CompType) VALUES ("'+value.ID+'", "'+value.Component+'", "'+value.CompType+'")';
		tx.executeSql(query);
     });
	 
	 $("#progressMessage").html("Components updated");
		pbar.setValue(85);
   }
   catch(error)
   {
	   $("#progressMessage").html("Error updating Components "+error);
			pbar.setValue(85);
	   
	 }
	  
   
   //comps2faults
   try
   {
         obj=jQuery.parseJSON(newdatabasetoinsert.comps2faults);
	     $.each(obj, function (key, value) {
		query='INSERT INTO COMPS2FAULTS (ID,FaultID) VALUES ("'+value.ID+'","'+value.FaultID+'")';
		tx.executeSql(query);
     });
	 
	 $("#progressMessage").html("Components2faults updated");
		pbar.setValue(90);
   }
      catch(error)
   {
	   $("#progressMessage").html("Error updating Components2faults "+error);
			pbar.setValue(90);
	   
	 }
   
   //faults
   
     try
   {
         obj=jQuery.parseJSON(newdatabasetoinsert.faults);
	     $.each(obj, function (key, value) {
		query='INSERT INTO FAULTS (ID,Description,Priority) VALUES ("'+value.ID+'","'+escapeDoubleQuotes(value.Description)+'","'+value.Priority+'")';
		tx.executeSql(query);
     });
	 
	  $("#progressMessage").html("Faults updated");
		pbar.setValue(90);
   }
        catch(error)
   {
	   $("#progressMessage").html("Error updating Faults "+error);
			pbar.setValue(90);
	   
	 }
	    //Lang2Label
     try
   {
         obj=jQuery.parseJSON(newdatabasetoinsert.lang2label);
	     $.each(obj, function (key, value) {
		query='INSERT INTO LANG2LABEL (LabelID,Type,Lang1,Lang3) VALUES ("'+value.LabelID+'","'+value.Type+'","'+value.Lang1+'","'+value.Lang3+'")';
		tx.executeSql(query);
     });
	 
	   $("#progressMessage").html("Lang2Label updated");
		pbar.setValue(90);
   }
        catch(error)
   {
	   $("#progressMessage").html("Error updating Lang2Label "+error);
			pbar.setValue(90);
	   
   }
	 
	     //Step2comps
   
         
		// alert(newdatabasetoinsert.steps2comps);
		// if(obj.length>0)
		// {
			  try
   {
	   obj=jQuery.parseJSON(newdatabasetoinsert.steps2comps);
			 	     $.each(obj, function (key, value) {
		query='INSERT INTO STEPS2COMPS (StepID,CompID) VALUES ("'+value.StepID+'","'+value.CompID+'")';
		tx.executeSql(query);
     });
   }
        catch(error)
   {
	   $("#progressMessage").html("Error updating STEPS2COMPS "+error);
			pbar.setValue(90);
	   
   }
   
   
			  try
   {
	   obj=jQuery.parseJSON(newdatabasetoinsert.rejectedprocedures);
			 	     $.each(obj, function (key, value) {
		query='INSERT INTO REJECTED (SubmitID,ProcID,Name,UserID,Status,SubmitDate,RejectReason) VALUES ("'+value.SubmitID+'","'+value.ProcID+'","'+escapeDoubleQuotes(value.Name)+'","'+value.UserID+'","'+value.Status+'","'+value.SubmitDate+'","'+value.RejectReason+'")';
		tx.executeSql(query);
     });
   }
        catch(error)
   {
	   $("#progressMessage").html("Error updating REJECTED "+error);
			pbar.setValue(90);
	   
   }
   
   			  try
   {
	   obj=jQuery.parseJSON(newdatabasetoinsert.Appsettings);
			 	     $.each(obj, function (key, value) {
		query='UPDATE SETTINGS SET Language="'+value.InterfaceLang+'",DateFormat="'+value.DateFormat+'"';
		tx.executeSql(query);
     });
   }
        catch(error)
   {
	   $("#progressMessage").html("Error updating SETTINGS "+error);
			pbar.setValue(90);
	   
   }
   
      			  try
   {
	   obj=jQuery.parseJSON(newdatabasetoinsert.Usersettings);
			 	     $.each(obj, function (key, value) {
		query='INSERT INTO UserSettings (UserID,ClientName,DateFormat,InterfaceLang,ShowCertAlerts) VALUES ("'+value.UserID+'","'+value.ClientName+'","'+value.DateFormat+'","'+value.InterfaceLang+'","'+value.ShowCertAlerts+'")';
		tx.executeSql(query);
     });
   }
        catch(error)
   {
	   $("#progressMessage").html("Error updating SETTINGS "+error);
			pbar.setValue(90);
	   
   }
			 
		//  }

	 
	 $("#progressMessage").html("Step2comp updated");
		pbar.setValue(95);
	 
	 
	 
	 $("#progressMessage").html("Faults updated");
		pbar.setValue(100);
	
	$("#progressMessage").html("Updated device database");
		$("#progressheader").html("Sync completed");
		IsSyncMessages=false;
	$("#progressMessage").html("");
		pbar.setValue(100);
		if(tt==0)
		{
					setTimeout( function(){ 
				  $(':mobile-pagecontainer').pagecontainer('change', '#pageMenu', {
        transition: 'flip',
        changeHash: false,
        reverse: true,
        showLoadMsg: true
    });
		$("#generic-dialog").dialog("close"); 
	//	navbyapp("menu");
		}, 3000 );
			
		}
		else
		{
					setTimeout( function(){ 
				  $(':mobile-pagecontainer').pagecontainer('change', '#pageLogin', {
        transition: 'flip',
        changeHash: false,
        reverse: true,
        showLoadMsg: true
    });
		$("#generic-dialog").dialog("close"); 
	//	navbyapp("menu");
		}, 3000 );
			
		}
		

		
		//alert("finishsssssss");	
		//alert("termino de subir archivos el tablet");
		//translatehtml();
	    updatelocaldatabase();
   
   //sendprocedures();


	
}

//function call submitted procedures


//SEND DATA TO SERVER
function sendprocedures()
{
	
	    showUpModal();
		IsSyncMessages=true;
	 	$("#progressheader").html("Collecting data...");
		$("#progressMessage").html("Preparing data to send");
		pbar.setValue(0);
	 sendproceduresarray="";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(Querytosendprocedures, errorCB);
	
}

function Querytosendprocedures(tx)
{
	//var querytosend="SELECT * FROM SUBMITTEDPROCS WHERE Sync='no' AND Status='0'";
	var querytosend="SELECT * FROM SUBMITTEDPROCS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QuerytosendproceduresSuccess, errorCB);
	
}

function QuerytosendproceduresSuccess(tx,results)
{
	var len = results.rows.length;
	var array = [];
	//alert(len);
for (var i=0; i<results.rows.length; i++){
 row = results.rows.item(i);

  array.push(JSON.stringify(row));

}

sendproceduresarray=array;
	$("#progressMessage").html("Procedures ready to send");
		pbar.setValue(10);
sendsteps();
	
}

function sendsteps()
{
	 sendstepsarray="";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(Querytosendsteps, errorCB);
	
}

function Querytosendsteps(tx)
{
	//var querytosend="SELECT submittedsteps.* FROM submittedprocs INNER JOIN submittedsteps ON submittedprocs.SubmitID = submittedsteps.SubmitID WHERE submittedprocs.Status='0' AND submittedsteps.Sync='no'";
	var querytosend="SELECT submittedsteps.* FROM submittedprocs INNER JOIN submittedsteps ON submittedprocs.SubmitID = submittedsteps.SubmitID WHERE submittedsteps.Sync='no'";
	tx.executeSql(querytosend, [], QuerytosendstepsSuccess, errorCB);
	
}

function QuerytosendstepsSuccess(tx,results)
{
	var len = results.rows.length;
	var array = [];
	//alert(len);
for (var i=0; i<results.rows.length; i++){
 row = results.rows.item(i);
 // alert(row.FaultID);
 array.push(JSON.stringify(row));
}

sendstepsarray=array;
	$("#progressMessage").html("Steps ready to send");
		pbar.setValue(20);
sendchecklists();

	
}

function sendchecklists()
{
	 sendchecklistarray="";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(Querytosendchecklists, errorCB);
	
}

function Querytosendchecklists(tx)
{
	var querytosend="SELECT * FROM USERS2CHECKLISTS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QuerytosendchecklistsSuccess, errorCB);
	
}

function QuerytosendchecklistsSuccess(tx,results)
{
	var len = results.rows.length;
	var array = [];
	//alert(len);
for (var i=0; i<results.rows.length; i++){
 		row = results.rows.item(i);
		array.push(JSON.stringify(row));



}
sendchecklistarray=array;
$("#progressMessage").html("Checklist ready to send");
pbar.setValue(30);
sendMessages();

	
}

function sendMessages()
{
	 sendmessages="";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytosendMessages, errorCB);
	
}

function QuerytosendMessages(tx)
{
	var querytosend="SELECT * FROM MESSAGES WHERE Sync='no' AND SentFT='no'";
	tx.executeSql(querytosend, [], QuerytosendMessagesSuccess, errorCB);
}

function QuerytosendMessagesSuccess(tx,results)
{
	var len = results.rows.length;
	//alert("messages="+len);
	var array = [];
	//alert(len);
for (var i=0; i<results.rows.length; i++){
 row = results.rows.item(i);
 // alert(row.Title);
 array.push(JSON.stringify(row));



}
//alert(array);
sendmessages=array;
	$("#progressMessage").html("Messages ready to send");
	pbar.setValue(40);
	sendSubmittedHours();

	
}

function sendSubmittedHours()
{
	//alert("submittedhours");
	 sendsubmittedhours="";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytosendSubmittedHours, errorCB);
	
}

function QuerytosendSubmittedHours(tx)
{
	var querytosend="SELECT * FROM SUBMITTEDHOURS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QuerytosendSubmittedHoursSuccess, errorCB);
}

function QuerytosendSubmittedHoursSuccess(tx,results)
{
	
	var len = results.rows.length;
	//alert("SubmittedHours="+len);
	var array = [];
	
	//alert(len);
for (var i=0; i<results.rows.length; i++){
 row = results.rows.item(i);
 // alert(row.Title);
 array.push(JSON.stringify(row));



}

sendsubmittedhours=array;
	$("#progressMessage").html("Submitted Hours ready to send");
		pbar.setValue(50);
		sendAuditsRows();

	
}
function sendAuditsRows()
{
	//alert("submittedhours");
	sendAuditsarray="";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytosendAudits, errorCB);
	
}

function QuerytosendAudits(tx)
{
	var querytosend="SELECT * FROM SUBMITTEDAUDITS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QuerytosendAuditsSuccess, errorCB);
}

function QuerytosendAuditsSuccess(tx,results)
{
	
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
	$("#progressMessage").html("Audits ready to send");
		pbar.setValue(50);
		sendAuditsOwnersRows();

	
}

function sendAuditsOwnersRows()
{
	//alert("submittedhours");
	sendAOwnersarray="";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytosendAuditsOwners, errorCB);
	
}

function QuerytosendAuditsOwners(tx)
{
	var querytosend="SELECT * FROM AUDITS2OWNERS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QuerytosendAuditsOwnersSuccess, errorCB);
}

function QuerytosendAuditsOwnersSuccess(tx,results)
{	
	var len = results.rows.length;
	var array = [];
	for (var i=0; i<results.rows.length; i++){
 	row = results.rows.item(i);
 	array.push(JSON.stringify(row));
}

sendAOwnersarray=array;
	$("#progressMessage").html("AuditsOwners ready to send");
		pbar.setValue(50);
		sendAuditsInspectorsRows();

	
}

function sendAuditsInspectorsRows()
{
	//alert("submittedhours");
	sendAInspectorsarray="";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytosendAuditsInspectors, errorCB);
	
}

function QuerytosendAuditsInspectors(tx)
{
	var querytosend="SELECT * FROM AUDITS2INSPECTORS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QuerytosendAuditsInspectorsSuccess, errorCB);
}

function QuerytosendAuditsInspectorsSuccess(tx,results)
{	
	var len = results.rows.length;
	var array = [];
	for (var i=0; i<results.rows.length; i++){
 	row = results.rows.item(i);
 	array.push(JSON.stringify(row));
}

sendAInspectorsarray=array;
	$("#progressMessage").html("AuditsOwners ready to send");
		pbar.setValue(50);
		sendCertRows();

	
}

function sendCertRows()
{
	//alert("submittedhours");
	sendCertificationsarray="";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytosendCert, errorCB);
	
}

function QuerytosendCert(tx)
{
	var querytosend="SELECT * FROM USERS2CERTS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QuerytosendCertSuccess, errorCB);
}

function QuerytosendCertSuccess(tx,results)
{
	
	var len = results.rows.length;
	//alert("SubmittedHours="+len);
	var array = [];
	
	//alert(len);
for (var i=0; i<results.rows.length; i++){
 row = results.rows.item(i);
 // alert(row.Title);
 array.push(JSON.stringify(row));



}

sendCertificationsarray=array;
	$("#progressMessage").html("Certifications ready to send");
		pbar.setValue(50);
		sendMeasInfo();

	
}

function sendMeasInfo()
{
	//alert("submittedhours");
	sendMeasArray="";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytosendMeasInfo, errorCB);
	
}

function QuerytosendMeasInfo(tx)
{
	var querytosend="SELECT * FROM SUBMITTEDMEAS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QuerysendMeasInfoSuccess, errorCB);
}

function QuerysendMeasInfoSuccess(tx,results)
{	
	var len = results.rows.length;
	var array = [];
for (var i=0; i<results.rows.length; i++){
 row = results.rows.item(i);
 array.push(JSON.stringify(row));
}

sendMeasArray=array;
	$("#progressMessage").html("Measurements ready to send");
		pbar.setValue(50);
		sendWpisInfo();

	
}

function sendWpisInfo()
{
	//alert("submittedhours");
	SendWpis="";
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytosendWpisInfo, errorCB);
	
}

function QuerytosendWpisInfo(tx)
{
	var querytosend="SELECT * FROM SUBMITTEDWPIS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QuerytosendWpisInfoSuccess, errorCB);
}

function QuerytosendWpisInfoSuccess(tx,results)
{	
	var len = results.rows.length;
	var array = [];
for (var i=0; i<results.rows.length; i++){
 row = results.rows.item(i);
 array.push(JSON.stringify(row));
}

SendWpis=array;
	$("#progressMessage").html("WPIs ready to send");
		pbar.setValue(50);
sendDataToServer();

	
}


function sendDataToServer()
{
	//alert("entro a enviar datos");
	var ipserver=$("#ipsync").val();
		$("#progressheader").html("Uploading Data...");
		$("#progressMessage").html("Preparing data to send");
		pbar.setValue(70);
	var obj = {};
 obj['procedures'] = JSON.stringify(sendproceduresarray);  //string
 obj['steps'] = JSON.stringify(sendstepsarray); 
 obj['checklists'] =JSON.stringify(sendchecklistarray); 
 obj['submittedcustomvalues'] ="[]";
 obj['Messages'] =JSON.stringify(sendmessages); 
 obj['SubmittedHours'] =JSON.stringify(sendsubmittedhours); 
 obj['CertificationsUpdate'] =JSON.stringify(sendCertificationsarray); 
 obj['AuditsUpdate'] =JSON.stringify(sendAuditsarray); 
 obj['Audits2Owners'] =JSON.stringify(sendAOwnersarray); 
 obj['Audits2Inspectors'] =JSON.stringify(sendAInspectorsarray); 
 obj['MeasUpdate'] =JSON.stringify(sendMeasArray); 
 obj['Wpis'] =JSON.stringify(SendWpis); 
 $("#progressMessage").html("Connecting to "+ipserver);
 //var kaka=obj['procedures'];
 //alert("enviar datos"+ipserver+'//SetDeviceDataarray');
 //alert(kaka);
  $.ajax({
                    type: 'POST',
				    url: ipserver+'//SetDeviceDataarray',
                    data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						pbar.setValue(100);
					
						sendmediaobj();// calling upload media
                       //alert(response.d);
           
                      
                    },
                    error: function (xmlHttpRequest, textStatus, errorThrown) {
                    $("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
                    //setTimeout(function () { $("#generic-dialog").dialog("close"); }, 2000);
					IsSyncMessages=false;
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
                });	
}

function SendMediaAudit()
{
	//alert("SendmediaAudit");
	$("#progressheader").html("Uploading Media Audits...");
	$("#progressMessage").html("Preparing data to send");
	pbar.setValue(0);
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QuerytosendAuditMedia, errorCB);
}

function QuerytosendAuditMedia(tx)
{
	var querytosend="SELECT * FROM AUDITMEDIA WHERE Sync='no'";
	tx.executeSql(querytosend, [], QuerytosendAuditMediaSuccess, errorCB);
}

function QuerytosendAuditMediaSuccess(tx,results)
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
			uploadPhotoServerAudit(results.rows.item(i).Path,results.rows.item(i).SubmitID,results.rows.item(i).StepID);
		}
	}
	else
	{
		$("#progressMessage").html("No Media found");
		pbar.setValue(100);
		Getservicedata();
		//llamar metodo
	}
}

 function sendmediaobj()
{
		$("#progressheader").html("Uploading Media...");
		$("#progressMessage").html("Preparing data to send");
		pbar.setValue(0);
	 var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(Querytosendmediaobj, errorCB);
	
}

function Querytosendmediaobj(tx)
{
	
	var querytosend="SELECT media.* FROM submittedprocs INNER JOIN media ON submittedprocs.SubmitID = media.SubmitID WHERE submittedprocs.Status='0' AND media.Sync='no'";
	//alert(querytosend);
	tx.executeSql(querytosend, [], QuerytosendmediaobjSuccess, errorCB);
	
	
}

function QuerytosendmediaobjSuccess(tx,results)
{
	var  len = results.rows.length;
	if(len>0)
	{
pptoshow=100/parseFloat(len, 10);
ppinitial=0;
var tosend=0;
//alert(pptoshow+ppinitial);
for (var i=0; i<results.rows.length; i++){
tosend++;
 if(results.rows.item(i).FileType=="image")
 {
	 uploadPhotoServer(results.rows.item(i).Path,results.rows.item(i).SubmitID,results.rows.item(i).StepID,results.rows.item(i).FileType,results.rows.item(i).SubmitDate);
  }
  else
  {
	 uploadVideoServer(results.rows.item(i).Path,results.rows.item(i).SubmitID,results.rows.item(i).StepID,results.rows.item(i).FileType,results.rows.item(i).SubmitDate);
   }
}		
	}
	else
	{
		$("#progressMessage").html("No Media found");
		pbar.setValue(100);
		GetservicedataTasks();		
	}	
}


//Upload Videos
function uploadVideoServer(VideoURI,SubmitID,StepID,FileType,SubmitDate) {
	//alert("akavideo"+VideoURI+"---->"+SubmitID+"---->"+StepID+"---->"+FileType);
	var ipserver=$("#ipsync").val();
	var dt = new Date();
	var SubmitDate=dt.toYMDhrs();
            var options = new FileUploadOptions();
			options.chunkedMode = true;
            options.fileKey="recFile";
            var imagefilename = Number(new Date())+".mp4";
            options.fileName=imagefilename;
            options.mimeType="video/mp4";

            var params = new Object();
            params.submitid = SubmitID;
            params.stepid = StepID;
			params.filetype = FileType;
			params.SubmitDate=SubmitDate;

            options.params = params;

            var ft = new FileTransfer();
			//
            //ft.upload(VideoURI, "http://"+ipserver+"/ftservice/service1.asmx/UploadFile", winftp, failftp, options);
			//alert("http://'+ipserver+'/service1.asmx/UploadFile");
			ft.upload(VideoURI, ipserver+"/UploadFile", winftp, failftp, options);
        }

//Upload Images
function uploadPhotoServer(imageURI,SubmitID,StepID,FileType,SubmitDate) {
	//alert("akaimage"+imageURI+"---->"+SubmitID+"---->"+StepID+"---->"+FileType);
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
			params.filetype = FileType;
			params.SubmitDate=SubmitDate;

            options.params = params;
			

            var ft = new FileTransfer();
           // ft.upload(imageURI, "http://"+ipserver+"/ftservice/service1.asmx/UploadFile", winftp, failftp, options);
		   
		   ft.upload(imageURI, ipserver+"/UploadFile", winftp, failftp, options);
        }

function winftp(r) {
	        // alert(r.response);
			ppinitial= parseFloat(ppinitial, 10)+parseFloat(pptoshow, 10);
            //console.log("Code = " + r.responseCode);
            //console.log("Response = " + r.response);
		//alert(pptoshow);
			//pptoshow= pptshow + ppinitial;
			//alert(r.response);
			$("#progressMessage").html("Sent = " + r.bytesSent+" Response ="+r.response);
			pbar.setValue(parseInt(ppinitial, 10));
			if(parseInt(ppinitial, 10)==100)
			{
				//alert("termino");
				GetservicedataTasks();
			}
			//pbar.setValue(pptoshow);
			//alert(pptoshow);
            //alert("Sent = " + r.bytesSent);
        }

        function failftp(error) {
            alert("An error has occurred uploading file: Code = " + error.code);
		}
		
		function uploadPhotoServerAudit(imageURI,SubmitID,StepID) {
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
				   ft.upload(imageURI, ipserver+"/UploadFileAudit", winftpAudit,failftpAudit,options);
		}

		function winftpAudit(r) {
			ppinitial= parseFloat(ppinitial, 10)+parseFloat(pptoshow, 10);
			$("#progressMessage").html("Sent = " + r.bytesSent+" Response ="+r.response);
			pbar.setValue(parseInt(ppinitial, 10));
			if(parseInt(ppinitial, 10)==100)
			{
				Getservicedata();	
				//funcion a llamar
			}
        }

        function failftpAudit(error) {
            alert("An error has occurred uploading file: Code = " + error.code);
		}


//function to update local database

function updatelocaldatabase()
{
		var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(Querytoupdatelocal, errorCB);
}

function Querytoupdatelocal(tx)
{
	tx.executeSql("UPDATE USERS2CHECKLISTS SET sync='yes'");
	tx.executeSql("UPDATE MEDIA SET sync='yes'");
	tx.executeSql("UPDATE AUDITMEDIA SET sync='yes'");
	tx.executeSql("UPDATE SUBMITTEDPROCS SET sync='yes'");
	tx.executeSql("UPDATE SUBMITTEDSTEPS SET sync='yes'");
	tx.executeSql("UPDATE SUBMITTEDHOURS SET sync='yes'");
	tx.executeSql("UPDATE SUBMITTEDAUDITS SET sync='yes'");
	tx.executeSql("UPDATE SUBMITTEDMEAS SET sync='yes'");
	tx.executeSql("UPDATE AUDITS2OWNERS SET sync='yes'");
	tx.executeSql("UPDATE SUBMITTEDWPIS SET sync='yes'");
	tx.executeSql("UPDATE AUDITS2INSPECTORS SET sync='yes'");
	tx.executeSql("UPDATE MESSAGES SET sync='yes' WHERE SentFT='0'");
	tx.executeSql("UPDATE USERS2CERTS SET sync='yes'");
	updateuserlevel();
	//alert("All updated");
}

function loginsync()
{
	tt=1;
	checkifexistdbreg('1');
}

function updateuserlevel()
{
	var idusera=sessionStorage.userid;	
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(updateuserlevelQuery, errorCB);
}

function updateuserlevelQuery(tx)
{
	var UseraID=sessionStorage.userid;
	tx.executeSql("SELECT * FROM USERS WHERE Username='"+UseraID+"'", [], updateuserlevelQuerySuccess, errorCB);
}

function  updateuserlevelQuerySuccess(tx,results)
{
	var len = results.rows.length;
	//alert("usuario "+len);
	if(len==1)
	{
				var fname=results.rows.item(0).FirstName;
				var lname=results.rows.item(0).LastName
				var fullname=fname+' '+lname;
				var LevelName="";
				if(results.rows.item(0).LevelNum!="" && results.rows.item(0).LevelNum!="null")
				{
				  LevelName=results.rows.item(0).LevelNum;
				}
				else
				{
				  LevelName=results.rows.item(0).AltLevel;
				}
				 sessionStorage.fname=fullname;
				 sessionStorage.lvlname=LevelName;
				 sessionStorage.lvltype=results.rows.item(0).LevelType;
				 sessionStorage.location=results.rows.item(0).Location;
	}
}

///////=============================<<<<<<<<<<<< END WEB SERVICES >>>>>>>>>>>=========================================///////