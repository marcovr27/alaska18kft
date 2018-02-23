///////<<<<<<<<<<<<============================= LOGBOOK PAGE =========================================>>>>>>>>>>>///////
var taskSelectedlog="";
var hoursReqLog;
var personnelOJT="";
var LevelReqHRSRTI="";
var itemsonlevel=0;
function FillPersonnel()
{
		var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryPersonnel, errorCB);
	
}
function QueryPersonnel(tx)
{
  
	tx.executeSql("SELECT * FROM Users ORDER BY LastName,FirstName", [], QueryPersonneSuccess, errorCB);
}
function QueryPersonneSuccess(tx,results)
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
	$("#select_personnelworked").html(selecthtml);		
}

function filltaskworked()
{
	//alert("filltaskworked");
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(Querytaskworked, errorCB);
	
}

function Querytaskworked(tx)
{
  var currentuserlocation=sessionStorage.location;
  tx.executeSql("SELECT * FROM DUTIES2TASKS WHERE Location='"+currentuserlocation+"' ORDER BY Duty,OrdNum", [], QuerytaskworkedSuccess, errorCB);
}

function QuerytaskworkedSuccess(tx, results)
{
	var len = results.rows.length;
	//alert(len);
	var selecthtml='<option value="0">Choose a task</option>';
	if(len>0)
	{
		for (var i=0; i<len; i++){
			//alert(results.rows.item(i).Duty+"==>"+results.rows.item(i).OrdNum);
			 selecthtml+='<option value="'+results.rows.item(i).TaskID+'">'+results.rows.item(i).TaskID+'</option>';
             }
		 $("#select_taskworked").html(selecthtml);	 
	}
	else
	{
	  navigator.notification.alert("No registered tasks", null, 'FieldTracker', 'Accept'); 
	}
	
	
}

function TaskSelected()
{
	var taskID=$("#select_taskworked").val();
	taskSelectedlog=taskID;
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryInfoTask, errorCB);
}

function QueryInfoTask(tx)
{
	//alert("SELECT * FROM TASKS WHERE TaskID='"+taskSelectedlog+"'");
	//alert("SELECT * FROM TASKS");
	var currentuserlocation=sessionStorage.location;
	tx.executeSql("SELECT * FROM TASKS WHERE ID='"+taskSelectedlog+"' AND Location='"+currentuserlocation+"'", [], QueryInfoTaskSuccess, errorCB);
	
}

function QueryInfoTaskSuccess(tx, results)
{
	var len = results.rows.length;
	//alert("task worked"+len);
	if(len>0)
	{
		//alert(results.rows.item(5).ReqHrsOJT);
		hoursReqLog=results.rows.item(0).ReqHrsOJT;
		//alert(hoursReqLog);
		$("#revaluetd").html(hoursReqLog);
		$("#table-logbook").table("refresh");
	 	$("#table-logbook").trigger('create');
		CalculateOJTHours();
		 
	}
	else
	{
	  navigator.notification.alert("Task not found", null, 'FieldTracker', 'Accept'); 
	}
	
	
}

function CalculateOJTHours()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryCalculateOJTHours, errorCB);	
}

function QueryCalculateOJTHours(tx)
{
	var iduser=sessionStorage.userid;	
	//alert("SELECT * FROM SUBMITTEDHOURS WHERE UserID='"+iduser+"' AND Task='"+taskSelectedlog+"'");
	tx.executeSql("SELECT * FROM SUBMITTEDHOURS WHERE UserID='"+iduser+"' AND Task='"+taskSelectedlog+"' AND (Status='Modified' OR Status='Approved')", [], QueryCalculateOJTHoursSuccess, errorCB);
}

function QueryCalculateOJTHoursSuccess(tx,results)
{
	var len = results.rows.length;
	var totalhours=0;
	var totalmins=0;
	//alert("registers"+len);
	if(len>0)
	{
		var totalminsh=0;
		for (var i=0; i<len; i++){
		//alert(results.rows.item(i).Hours);	
		totalhours+= parseFloat(results.rows.item(i).Hours);
		totalmins+= parseFloat(results.rows.item(i).Mins);
		}
		//alert("hours="+totalhours+ "mins="+totalmins);
		if(totalmins>0)
		{
			totalmins=parseFloat(totalmins)*(1/60);
			
		}
		//alert("hours on minutes="+totalminsh);
		
		var totalfix=parseFloat(totalhours)+parseFloat(totalmins);
		totalfix=totalfix.toFixed(2)
		//alert("total hours completed"+totalfix);
		var completedH=totalfix;
		var requiredText=parseFloat(hoursReqLog)-parseFloat(completedH);
		var Done=parseFloat(completedH)/parseFloat(hoursReqLog)*100;
		//alert("done percent="+Done);
		var DoneF=parseFloat(Done).toFixed(0);
		$("#completedvaluetd").html(completedH);//hours completed
		$("#hourstogovaluetd").html(requiredText);//hourtogo
		$("#donevaluetd").html(DoneF+"%"); //percent
		
	}
	else
	{
		$("#completedvaluetd").html("0");//hours completed
		$("#hourstogovaluetd").html("0");//hourtogo
		$("#donevaluetd").html("0%"); //percent
		
	}
	
}

function SubmitOJT()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(function(tx){ QuerySubmitOJT(tx) }, errorCB);
	
}
function QuerySubmitOJT(tx)
{
	var EntryDates=$("#entryonevalue").val();
	//alert("task="+taskSelectedlog+" Personnel="+personnelOJT);
	
	if(taskSelectedlog!="")
	{	  
		  if(EntryDates!="")
		  {
			var dt = new Date();
			var submitID = sessionStorage.userid+new Date().getTime() + Math.random();
			var UseraID=sessionStorage.userid;
			var hourstime=$("#hourentryone").val();
			var minstime=$("#minutesentryone").val();
			var leveluser=sessionStorage.lvlname;
			var SubmitTime=dt.toYMDhrs()
			//var SubDate=dt.toYMD();
    		var TaskID=taskSelectedlog;
			var query='INSERT INTO SUBMITTEDHOURS (SubmitID,UserID,Type,Status,SubmitDate,EntryDate,Task,LevelNum,Hours,Mins,PersonnelID,Sync) VALUES("'+submitID+'","'+UseraID+'","O","Submitted","'+SubmitTime+'","'+InsertFormatDate(EntryDates)+'","'+taskSelectedlog+'","'+leveluser+'","'+hourstime+'","'+minstime+'","'+personnelOJT+'","no")';
			//alert(query);
			tx.executeSql(query);  
			 navigator.notification.confirm(
    					'Saved',      // mensaje (message)
    						onsuccessojt,      // función 'callback' a llamar con el índice del botón pulsado (confirmCallback)
   							 'FieldTracker',            // titulo (title)
        				'Accept'          // botones (buttonLabels)
        				);
			
		  }
		  else
		  {
			 navigator.notification.alert("Please Enter Entry Date", null, 'FieldTracker', 'Accept');  
			 $( "#onebt" ).addClass("ui-btn-active");
			 
		  }
		
	}
	else
	{
		  navigator.notification.alert("Please Select Task", null, 'FieldTracker', 'Accept'); 
		  $( "#onebt" ).addClass("ui-btn-active");
		
		 
	}

}

 function onsuccessojt(button) {
	StartInsertDirect();
 try
	 {
		 $("#popupmuchtime").popup('close');
	 }
	 catch(error){}
$( "#onebt" ).addClass("ui-btn-active");
$("#entryonevalue").val("");	 
$("#hourentryone").val("");
$("#minutesentryone").val("");
TaskSelected();
GetSubmissions();
 }

function PersonnelO()
{
	var IDuserpersonnel=$("#select_personnelworked").val();
	personnelOJT=IDuserpersonnel;
}

function CheckHoursOJT()
{
	var hourstime=$("#hourentryone").val();
	var minstime=$("#minutesentryone").val();
	if(hourstime=="")
	{
		hourstime=0;
	}
	if(minstime=="")
	{
		minstime=0;
	}
	if(hourstime>0 || minstime>0)
	{
			if(hourstime>=11)
	{
		//alert("primer if ="+hourstime );
		
		if(hourstime>11)
		{
			$("#popupmuchtime").popup("open");
		}
		else if(hourstime=11 && minstime>=30)
		{
			$("#popupmuchtime").popup("open");
			
		}
		else
		{
			//SubmitOJT();
			//alert("primerllamado");
			CheckHoursT();
			
		}
		
	}
	else
	{
		//SubmitOJT();
		//alert("segundollamado");
		CheckHoursT();
	}
		
	}
	else
	{
		navigator.notification.alert("Please Enter Hours for this entry", null, 'FieldTracker', 'Accept'); 
		$( "#onebt" ).addClass("ui-btn-active");
	}
	//alert("hours"+hourstime+" mins"+minstime);

	
	
	
}

function CheckHoursT()
{
	//alert("hourst");
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryCheckHoursT, errorCB);
}

function QueryCheckHoursT(tx)
{
//	alert("entro");
	var now = new Date();
	var day = ("0" + now.getDate()).slice(-2);
	var month = ("0" + (now.getMonth() + 1)).slice(-2);
	var today = now.getFullYear()+"-"+(month)+"-"+(day) ;
	var UseraID=sessionStorage.userid;
	var query="SELECT SUM(Hours) as Hora, SUM(Mins) as minutos FROM SubmittedHours WHERE UserID='"+UseraID+"' AND SubmitDate BETWEEN DATE('now') AND DATE('now', '+1 day')";
	//alert(query);
	tx.executeSql(query, [], QueryCheckHoursTSuccess, errorCBMes);
}

function QueryCheckHoursTSuccess(tx,results)
{
	try
	{
		var len = results.rows.length;
		var hours="0";
		var mins="0";
		var hourstimesuma=$("#hourentryone").val();
		var minstimesuma=$("#minutesentryone").val();
		if(hourstimesuma=="")
		{
			hourstimesuma=0;
		}
		if(minstimesuma=="")
		{
			minstimesuma=0;
		}
	  // alert("aki vamos"+len);
		for (var i=0; i<results.rows.length; i++){
			//alert(results.rows.item(i).Hora);
			//alert(results.rows.item(i).SubmitDate);
			if(results.rows.item(i).Hora!="" || results.rows.item(i).Hora!="null")
			{
				hours=results.rows.item(i).Hora;
			}
			if(results.rows.item(i).minutos!="" || results.rows.item(i).minutos!="null")
			{
				mins=results.rows.item(i).minutos;
			}
		}
		if(hours==null)
		{
			hours=0;
		}
		if(mins==null)
		{
			mins=0;
		}
		//alert("horas: "+hours+" mins:"+mins);
		var hourstime=parseFloat(hours);
		var minstime=parseFloat(mins);
		hourstime=parseFloat(hourstime)+parseFloat(hourstimesuma);
		minstime=parseFloat(minstime)+parseFloat(minstimesuma);
		//alert("tiempo: "+hourstime+":"+minstime);
		if(hourstime=="")
		{
			hourstime=0;
		}
		if(minstime=="")
		{
			minstime=0;
		}
		if(hourstime>0 || minstime>0)
		{
				if(hourstime>=11)
		{
			//alert("primer if ="+hourstime );
			
			if(hourstime>11)
			{
				$("#popupmuchtime").popup("open");
			}
			else if(hourstime=11 && minstime>=30)
			{
				$("#popupmuchtime").popup("open");
				
			}
			else
			{
				//alert("guardo");
				SubmitOJT();
				
			}
			
		}
		else
		{
			//alert("guardo");
			SubmitOJT();
		}
	}

	}
	catch(error)
	{
		alert(error);
	}


}

function fillitemworked()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(Queryitemworked, errorCB);
	
}

function Queryitemworked(tx)
{
	var leveluser=sessionStorage.lvlname;
	var currentuserlocation=sessionStorage.location;
	var query='SELECT Levels2Items.ID,Levels2Items.Location,Items.CourseID FROM LEVELS2ITEMS INNER JOIN Items ON Levels2Items.ID=Items.ID WHERE Levels2Items.LevelNum="'+leveluser+'" AND Levels2Items.Location="'+currentuserlocation+'" ORDER BY Levels2Items.ID';
  tx.executeSql(query, [], QueryitemworkedSuccess, errorCB);
}

function QueryitemworkedSuccess(tx, results)
{
	var len = results.rows.length;
	//alert(len);
	var selecthtml='<option value="0">Choose a Item</option>';
	if(len>0)
	{
		for (var i=0; i<len; i++){
			if(results.rows.item(i).CourseID==null || results.rows.item(i).CourseID=="")
			{
				selecthtml+='<option value="'+results.rows.item(i).ID+'">'+results.rows.item(i).ID+'</option>';
			}
			 
             }
		 $("#select_itemsworkedon").html(selecthtml);	 
	}
	else
	{
	  navigator.notification.alert("No registered Items", null, 'FieldTracker', 'Accept'); 
	}
	
	
}

function InfoLevel()
{
	//LevelReqHRSRTI
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryInfoLevel, errorCB);
}

function QueryInfoLevel(tx)
{
	var leveluser=sessionStorage.lvlname;
	var currentuserlocation=sessionStorage.location;
	tx.executeSql("SELECT * FROM LEVELS WHERE LevelNum='"+leveluser+"' AND Location='"+currentuserlocation+"'", [], QueryInfoLevelSuccess, errorCB);
}

function QueryInfoLevelSuccess(tx,results)
{
	var len = results.rows.length;
	if(len>0)
	{
		LevelReqHRSRTI=results.rows.item(0).ReqHrsRTI;
	}
	else
	{
		 navigator.notification.alert("User Level not found", null, 'FieldTracker', 'Accept'); 
	}
	
}

function ItemSelected()
{
	SearchTimeintrackingcourse();
	//var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    //db.transaction(QueryInfoItem, errorCB);
}

function SearchTimeintrackingcourse()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryInfosearchtime, errorCB);

}

function QueryInfosearchtime(tx)
{
	var ItemSelected=$("#select_itemsworkedon").val();
	var iduser=sessionStorage.userid;
	var leveluser=sessionStorage.lvlname;
	$("#minscoursesh").val('0');
	var query="SELECT SUM(TimeTracking.TotalTime) as secs FROM Items INNER JOIN TimeTracking on Items.CourseID=TimeTracking.ContentID WHERE TimeTracking.UserID='"+iduser+"' AND Items.ID='"+ItemSelected+"'";
	//alert(query);
	tx.executeSql(query, [],  QueryInfosearchtimeSuccess, errorCB);
    //tx.executeSql("SELECT * FROM TimeTracking", [],  QueryInfosearchtimeSuccess, errorCB);
}

function QueryInfosearchtimeSuccess(tx,results)
{
	var len = results.rows.length;
	if(len>0)
	{
		//alert(results.rows.item(0).secs)
		if(results.rows.item(0).secs==null)
		{
			$("#minscoursesh").val('0');

		}
		else
		{
			$("#minscoursesh").val(results.rows.item(0).secs);
		}
		//var segundoide=$("#minscoursesh").val();
		//alert("segundos= "+segundoide);
		newinfoitemss();

	}
	else
	{
		$("#minscoursesh").val('0');
		newinfoitemss();
	}
}

function newinfoitemss()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryInfoItem, errorCB);

}

function QueryInfoItem(tx)
{
	//alert("SELECT * FROM TASKS WHERE TaskID='"+taskSelectedlog+"'");
	//alert("SELECT * FROM TASKS");
	var ItemSelected=$("#select_itemsworkedon").val();
	var iduser=sessionStorage.userid;
	var leveluser=sessionStorage.lvlname;
	tx.executeSql("SELECT * FROM SUBMITTEDHOURS WHERE UserID='"+iduser+"' AND Item='"+ItemSelected+"' AND LevelNum='"+leveluser+"' AND (Status='Modified' OR Status='Approved')", [], QueryInfoItemSuccess, errorCB);
	
}

function QueryInfoItemSuccess(tx, results)
{
	var len = results.rows.length;
	var completedHoursClass=0;
	var Doneclasshours=0;
	var hoursTogoClass=0;
	var totalhours=0;
	var totalmins=0;
	var otherhours=0;
	var segundoide=$("#minscoursesh").val();
	//alert(segundoide);
	otherhours=parseFloat(segundoide)/3600;
	//LevelReqHRSRTI Hours To complete
	$("#revalueitemtd").html(LevelReqHRSRTI);
	//alert(len);
	//alert("task worked"+len);
	if(len>0)
	{

			for (var i=0; i<len; i++){	
				//alert(results.rows.item(i).Hours+":"+results.rows.item(i).Mins);
		totalhours+= parseFloat(results.rows.item(i).Hours);
		totalmins+= parseFloat(results.rows.item(i).Mins);
		}
				if(totalmins>0)
		{
			totalmins=parseFloat(totalmins)*(1/60);
			
		}
		//alert(totalhours);
		//alert("hours on minutes="+totalmins);
		
		var totalfix=parseFloat(totalhours)+parseFloat(totalmins)+parseFloat(otherhours);
		totalfix=parseFloat(totalfix).toFixed(2);
		//alert(totalfix);
		//alert("total hours completed"+totalfix);
		completedHoursClass=parseFloat(totalfix);
		hoursTogoClass=parseFloat(LevelReqHRSRTI)-parseFloat(completedHoursClass);
		//alert("completed:"+completedHoursClass+"togo:"+hoursTogoClass);
		var Done=parseFloat(completedHoursClass)/parseFloat(LevelReqHRSRTI)*100;
		Doneclasshours=parseFloat(Done).toFixed(0);
		//alert(results.rows.item(5).ReqHrsOJT);
		//alert(hoursReqLog);
		

		 
	}
	else
	{
		
		if(otherhours>0)
		{
			var totalfix=parseFloat(totalhours)+parseFloat(totalmins)+parseFloat(otherhours);
		totalfix=parseFloat(totalfix).toFixed(2);
			completedHoursClass=parseFloat(totalfix);
		hoursTogoClass=parseFloat(LevelReqHRSRTI)-parseFloat(completedHoursClass);
		//alert("completed:"+completedHoursClass+"togo:"+hoursTogoClass);
		var Done=parseFloat(completedHoursClass)/parseFloat(LevelReqHRSRTI)*100;
		Doneclasshours=parseFloat(Done).toFixed(0);
		}
	}

	$("#completedvalueitemtd").html(completedHoursClass);
	$("#hourstogovalueitemtd").html(hoursTogoClass);
	$("#donevalueitemtd").html(Doneclasshours+"%");
	$("#table-logbookItems").table("refresh");
	$("#table-logbookItems").trigger('create');
	CalculateItems(tx)
	
	
}


function CalculateItems(tx)
{
	itemsonlevel=0;
	var ItemSelected=$("#select_itemsworkedon").val();
	if(ItemSelected!="0")
	{
	var leveluser=sessionStorage.lvlname;
	var currentuserlocation=sessionStorage.location;
	//alert("SELECT * FROM SUBMITTEDHOURS WHERE UserID='"+iduser+"' AND LevelNum='"+taskSelectedlog+"' AND Item='"+ItemSelected+"'");
	tx.executeSql("SELECT * FROM LEVELS2ITEMS WHERE LevelNum='"+leveluser+"' AND Location='"+currentuserlocation+"'", [], QueryCalculateItemsSuccess, errorCB);
		
		
	}
	
}


function QueryCalculateItemsSuccess(tx,results)
{
	var len = results.rows.length;
	itemsonlevel=len;
    var leveluser=sessionStorage.lvlname;
	//alert("Leves2items level"+len);
	tx.executeSql("SELECT DISTINCT(Item) FROM SubmittedHours WHERE LevelNum='"+leveluser+"'  AND Type='C'", [], QueryCalSubSuccess, errorCB);
	

}

function QueryCalSubSuccess(tx,results)
{
	var len = results.rows.length;
	//alert("COMPLETED ITEMS SUBMIITED= "+len);
	var ItemsToGo=parseFloat(itemsonlevel)-parseFloat(len);
	//alert("ItemsTogo"+ItemsToGo);
	var DoneToGo=parseFloat(len)/parseFloat(itemsonlevel)*100;
	DoneToGo=DoneToGo.toFixed(0);
	//alert("DoneItemsper="+DoneToGo);
	$("#revalueitemtwotd").html(itemsonlevel);
	$("#completedvalueitetwomtd").html(len);
	$("#hourstogovalueitemtwotd").html(ItemsToGo);
	$("#donevalueitemtwotd").html(DoneToGo+"%");
	$("#table-logbookItems").table("refresh");
	$("#table-logbookItems").trigger('create');
}

function CheckitemsValues()
{
	//alert("checkitems");
		var hourstime=$("#hourentryitemonec").val();
	var minstime=$("#minutesentryitemonec").val();
	//alert
	if(hourstime=="")
	{
		hourstime=0;
	}
	if(minstime=="")
	{
		minstime=0;
	}
	if(hourstime>0 || minstime>0)
	{
			if(hourstime>=10)
	{
		//alert("primer if ="+hourstime );
		
		if(hourstime>11)
		{
			$("#popupmuchtimeC").popup("open");
		}
		else if(hourstime=11 && minstime>=30)
		{
			$("#popupmuchtimeC").popup("open");
			
		}
		else
		{
			CheckHoursCC();
			
		}
		
	}
	else
	{
		CheckHoursCC();
	}
		
	}
	else
	{
		navigator.notification.alert("Please Enter Hours for this entry", null, 'FieldTracker', 'Accept'); 
		$( "#twobt" ).addClass("ui-btn-active");
	}
	//alert("hours"+hourstime+" mins"+minstime);
	
}
function CheckHoursCC()
{
	//alert("cc");
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryCheckHoursCC, errorCB);
}

function QueryCheckHoursCC(tx)
{
//	alert("entro");
	var now = new Date();
	var day = ("0" + now.getDate()).slice(-2);
	var month = ("0" + (now.getMonth() + 1)).slice(-2);
	var today = now.getFullYear()+"-"+(month)+"-"+(day) ;
	var UseraID=sessionStorage.userid;
	var query="SELECT SUM(Hours) as Hora, SUM(Mins) as minutos FROM SubmittedHours WHERE UserID='"+UseraID+"' AND SubmitDate BETWEEN DATE('now') AND DATE('now', '+1 day')";
	//alert(query);
	tx.executeSql(query, [], QueryCheckHoursCSuccess, errorCBMes);
}

function QueryCheckHoursCSuccess(tx,results)
{
	var len = results.rows.length;
	var hours="0";
	var mins="0";
	var hourstimesuma=$("#hourentryone").val();
	var minstimesuma=$("#minutesentryone").val();
	if(hourstimesuma=="")
	{
		hourstimesuma=0;
	}
	if(minstimesuma=="")
	{
		minstimesuma=0;
	}
	//alert(len);
	for (var i=0; i<results.rows.length; i++){
		//alert(results.rows.item(i).Hora);
		//alert(results.rows.item(i).SubmitDate);
		if(results.rows.item(i).Hora!="" || results.rows.item(i).Hora!="null")
		{
			hours=results.rows.item(i).Hora;
		}
		if(results.rows.item(i).minutos!="" || results.rows.item(i).minutos!="null")
		{
			mins=results.rows.item(i).minutos;
		}
	}
	if(hours==null)
	{
		hours=0;
	}
	if(mins==null)
	{
		mins=0;
	}
	//alert("horas: "+hours+" mins:"+mins);
	var hourstime=parseFloat(hours);
	var minstime=parseFloat(mins);
	hourstime=parseFloat(hourstime)+parseFloat(hourstimesuma);
	minstime=parseFloat(minstime)+parseFloat(minstimesuma);
	//alert("tiempo: "+hourstime+":"+minstime);
	if(hourstime=="")
	{
		hourstime=0;
	}
	if(minstime=="")
	{
		minstime=0;
	}
	if(hourstime>0 || minstime>0)
	{
			if(hourstime>=11)
	{
		//alert("primer if ="+hourstime );
		
		if(hourstime>11)
		{
			$("#popupmuchtime").popup("open");
		}
		else if(hourstime=11 && minstime>=30)
		{
			$("#popupmuchtime").popup("open");
			
		}
		else
		{
			//alert("guardo");
			SubmitItem();
			
		}
		
	}
	else
	{
		//alert("guardo");
		SubmitItem();
	}
}

}

function SubmitItem()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(function(tx){ QuerySubmitItem(tx) }, errorCB);
}
function QuerySubmitItem(tx)
{
		var EntryDates=$("#entryoneitemvalue").val();
			var ItemSelected=$("#select_itemsworkedon").val();
	//alert("task="+taskSelectedlog+" Personnel="+personnelOJT);
	
	if(ItemSelected!="0")
	{

		  
		  if(EntryDates!="")
		  {
			var dt = new Date();
			var submitID = sessionStorage.userid+new Date().getTime() + Math.random();
			var UseraID=sessionStorage.userid;
			var hourstime=$("#hourentryitemonec").val();
			var minstime=$("#minutesentryitemonec").val();
			var leveluser=sessionStorage.lvlname;
			var SubmitTime=dt.toYMDhrs()
		
			//var SubDate=dt.toYMD();
    		var TaskID=taskSelectedlog;
			var query='INSERT INTO SUBMITTEDHOURS (SubmitID,UserID,Type,Status,SubmitDate,EntryDate,Item,LevelNum,Hours,Mins,Sync) VALUES("'+submitID+'","'+UseraID+'","C","Submitted","'+SubmitTime+'","'+InsertFormatDate(EntryDates)+'","'+ItemSelected+'","'+leveluser+'","'+hourstime+'","'+minstime+'","no")';
			//alert(query);
			tx.executeSql(query);  
			 navigator.notification.confirm(
    					'Saved',      // mensaje (message)
    						onsuccessojtclass,      // función 'callback' a llamar con el índice del botón pulsado (confirmCallback)
   							 'FieldTracker',            // titulo (title)
        				'Accept'          // botones (buttonLabels)
        				);
			
		  }
		  else
		  {
			 navigator.notification.alert("Please Enter Entry Date", null, 'FieldTracker', 'Accept');  
			 $( "#twobt" ).addClass("ui-btn-active");
		  }

		  
	

		
	}
	else
	{
		  navigator.notification.alert("Please Select Item", null, 'FieldTracker', 'Accept'); 
		  $( "#twobt" ).addClass("ui-btn-active");
		
		 
	}
}

 function onsuccessojtclass(button) {
	 StartInsertDirect();
	 try
	 {
		 $("#popupmuchtimeC").popup('close');
	 }
	 catch(error){}
$( "#twobt" ).addClass("ui-btn-active");	 
//$('#two').trigger('click');	 
$("#entryoneitemvalue").val("");	 
$("#hourentryitemonec").val("");
$("#minutesentryitemonec").val("");
$('#one').trigger('click');
ItemSelected();
GetSubmissions();
 }

//function CountHours



///////<<<<<<<<<<<<=============================END FUNCTION LOGBOOK PAGE  =========================================>>>>>>>>>>>///////

function StartInsertDirect()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
	db.transaction(GetStartInsert, errorCB);	
}

function GetStartInsert(tx)
{
	var querytosend="SELECT * FROM SETTINGS";
	tx.executeSql(querytosend, [], function(tx,results){ GetStartInsertSuccess(tx,results) }, errorCB);
}

function GetStartInsertSuccess(tx,results)
{
	var len = results.rows.length;
	if(len>0)
	{
		$("#ipsync").val(results.rows.item(0).IP);
		StartSyncLogbookExe();
	}
}

function StartSyncLogbookExe()
{
	var ipserver=$("#ipsync").val();
	sendHoursalone="";
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryLogbookExe, errorCB);	
}

function QueryLogbookExe(tx)
{
	var querytosend="SELECT * FROM SUBMITTEDHOURS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QueryLogbookExeSuccess, errorCB);
}

function QueryLogbookExeSuccess(tx,results)
{
	var len = results.rows.length;
	var array = [];
	for (var i=0; i<results.rows.length; i++){
 	row = results.rows.item(i);
 	array.push(JSON.stringify(row));
	}	
	sendHoursalone=array;
	ExecutePostLogAlone();
}

function ExecutePostLogAlone()
{
	var ipserver=$("#ipsync").val();
	var obj = {};
	obj['SubmittedHours'] =JSON.stringify(sendHoursalone); 
	 $.ajax({
                    type: 'POST',
                   // url: 'http://192.168.1.129/test/serviceFt.asmx//SetDeviceDataarray',
				    url: ipserver+'//SetSubmmitedHours',
                    data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						if(response.d=="success")
						{
							updatenowlogsincy();
						}
						
           
                      
                    },
                    error: function (xmlHttpRequest, textStatus, errorThrown) {
						//alert("error silence sync");
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
                });
}

//UPDATE LOGBOOK


//Sync
function StartInsertDirectX()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
	db.transaction(GetStartInsertX, errorCB);	
}

function GetStartInsertX(tx)
{
	var querytosend="SELECT * FROM SETTINGS";
	tx.executeSql(querytosend, [], function(tx,results){ GetStartInsertSuccessX(tx,results) }, errorCB);
}

function GetStartInsertSuccessX(tx,results)
{

	var len = results.rows.length;
	if(len>0)
	{
		$("#ipsync").val(results.rows.item(0).IP);
		StartSyncLogbookExeX();
	}
}

function StartSyncLogbookExeX()
{
	var ipserver=$("#ipsync").val();
	sendHoursalone="";
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryLogbookExeX, errorCB);	
}

function QueryLogbookExeX(tx)
{

	var querytosend="SELECT * FROM SUBMITTEDHOURS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QueryLogbookExeSuccessX, errorCB);
}

function QueryLogbookExeSuccessX(tx,results)
{
	var len = results.rows.length;
	var array = [];
	for (var i=0; i<results.rows.length; i++){
 	row = results.rows.item(i);
 	array.push(JSON.stringify(row));
	}	
	sendHoursalone=array;
	ExecutePostLogAloneX();
}

function ExecutePostLogAloneX()
{
	var ipserver=$("#ipsync").val();
	var obj = {};
	obj['SubmittedHours'] =JSON.stringify(sendHoursalone); 
	 $.ajax({
                    type: 'POST',
                   // url: 'http://192.168.1.129/test/serviceFt.asmx//SetDeviceDataarray',
				    url: ipserver+'//SetSubmmitedHours',
                    data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						if(response.d=="success")
						{
							UpdateLogbookSync();
						}
						
           
                      
                    },
                    error: function (xmlHttpRequest, textStatus, errorThrown) {
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
                });
}

function UpdateLogbookSync()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
	db.transaction(GetStartUpdateLogbook, errorCB);	
}

function GetStartUpdateLogbook(tx)
{
	var querytosend="SELECT * FROM SETTINGS";
	tx.executeSql(querytosend, [], function(tx,results){ GetStartUpdateLogbookSuccess(tx,results) }, errorCB);	
}

function GetStartUpdateLogbookSuccess(tx,results)
{
	var len = results.rows.length;
	if(len>0)
	{
		$("#ipsync").val(results.rows.item(0).IP);
		StartSyncLogbookRead();
	}
}

function StartSyncLogbookRead()
{
	var ipserver=$("#ipsync").val();
	var obj = {};
	if(!!sessionStorage.userid)
	{
	  obj['UserID'] =sessionStorage.userid;
	}
	else
	{
	 obj['UserID'] ="";
	}
	            $.ajax({
                    type: 'POST',
				    url:ipserver+'//GetSubmittedHours',
					data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						InsertDatabaseSubmitHoursLog(response.d);
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
                });	
}

function InsertDatabaseSubmitHoursLog(newdatabase)
{
	newhoursdatatoinsert=newdatabase;
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QuerytoinsertSubmitHoursLog, errorCB);
	
}

function QuerytoinsertSubmitHoursLog(tx)
{
	var idusera=sessionStorage.userid;	
	if(!!sessionStorage.userid)
	{
		//alert("Deleting "+idusera);
		tx.executeSql("DELETE FROM SUBMITTEDHOURS WHERE UserID='"+idusera+"'");
	}
	var query;
	var obj = jQuery.parseJSON(newhoursdatatoinsert.SubmittedHours);
	var itemcount=0;
	var cuantos=obj.length;
		 try
		 {
    $.each(obj, function (key, value) {
		query='INSERT INTO SUBMITTEDHOURS (SubmitID,UserID,Type,Status,SubmitDate,EntryDate,Task,LevelNum,Item,Hours,Mins,PersonnelID,SupervisorID,RejectReason,ReviewDate,Sync) VALUES ("'+escapeDoubleQuotes(value.SubmitID)+'", "'+escapeDoubleQuotes(value.UserID)+'", "'+escapeDoubleQuotes(value.Type)+'", "'+escapeDoubleQuotes(value.Status)+'", "'+value.SubmitDate+'", "'+value.EntryDate+'", "'+escapeDoubleQuotes(value.Task)+'", "'+value.LevelNum+'", "'+escapeDoubleQuotes(value.Item)+'", "'+value.Hours+'", "'+value.Mins+'", "'+value.PersonnelID+'", "'+value.SupervisorID+'", "'+value.RejectReason+'", "'+value.ReviewDate+'","yes")';
		tx.executeSql(query);
		itemcount++;		
		if(itemcount==cuantos)
		{
			//filltaskworked();
			ExcuteSylenceTimeTracking();
		}
     });
	 }
	 catch(error)
	 {
		 alert(error);
	 }

}
function ExcuteSylenceTimeTracking()
{	
	var ipserver=$("#ipsync").val();
	                $.ajax({
                    type: 'POST',
				    url:ipserver+'//GetTimeTracking',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						InsertDatabaseTimeTrackingSylencPM(response.d);
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
					IsSyncMessages=false;		
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
                });
}

function InsertDatabaseTimeTrackingSylencPM(newdatabase)
{

		newtimetrackingtoinsert=newdatabase;
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytoinsertTimeTrackingPMSS, errorCB);
	
}

function QuerytoinsertTimeTrackingPMSS(tx)
{
	tx.executeSql("DELETE FROM TIMETRACKING");
	var query;
	var obj = jQuery.parseJSON(newtimetrackingtoinsert.TimeTracking);
	var itemcount=0;
	 try
	 {
    $.each(obj, function (key, value) {
		query='INSERT INTO TIMETRACKING  (UserID,ContentID,TotalTime,Date,ClassID) VALUES ("'+escapeDoubleQuotes(value.UserID)+'", "'+escapeDoubleQuotes(value.ContentID)+'", "'+value.TotalTime+'", "'+value.Date+'", "'+escapeDoubleQuotes(value.ClassID)+'")';
		tx.executeSql(query);
		itemcount++;
     });
	 }
	 catch(error)
	 {
		 alert(error);		 
	 }
	 filltaskworked();
}


function updatenowlogsincy()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(function(tx){ Queryupdatenowlogsincy(tx) }, errorCB);	
}

function Queryupdatenowlogsincy(tx)
{
	//alert("entra al update");
	var idusera=sessionStorage.userid;
	var query="UPDATE SUBMITTEDHOURS SET sync='yes' WHERE UserID='"+idusera+"'";
	//alert(query);
	tx.executeSql(query);
	//alert("ejecuta"); 	
	
}
/// Sync Modal
function opensyncLogb()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
	db.transaction(GetopensyncLogb, errorCB);	
}

function GetopensyncLogb(tx)
{
	var querytosend="SELECT * FROM SETTINGS";
	tx.executeSql(querytosend, [], function(tx,results){ GetopensyncLogbSuccess(tx,results) }, errorCB);
}

function GetopensyncLogbSuccess(tx,results)
{

	var len = results.rows.length;
	if(len>0)
	{
		$("#ipsync").val(results.rows.item(0).IP);
		StartSyncModalLogbook();
	}
}
function StartSyncModalLogbook()
{
	var ipserver=$("#ipsync").val();
	sendHoursalone="";
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryModalLogbook, errorCB);	
}

function QueryModalLogbook(tx)
{

	var querytosend="SELECT * FROM SUBMITTEDHOURS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QueryModalLogbookSuccess, errorCB);
}

function QueryModalLogbookSuccess(tx,results)
{
	 showUpModal();
	 $("#progressheader").html("Connecting...");
	$("#progressMessage").html("Waiting for server connection");
	pbar.setValue(0);
	var len = results.rows.length;
	var array = [];
	for (var i=0; i<results.rows.length; i++){
 	row = results.rows.item(i);
 	array.push(JSON.stringify(row));
	}	
	sendHoursalone=array;
	ExcutePostModalTimeTracking();
}

function ExcutePostModalTimeTracking()
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
						InsertDatabaseTimeTrackingPM(response.d);
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

function InsertDatabaseTimeTrackingPM(newdatabase)
{

	$("#progressMessage").html("Successful connection");
		pbar.setValue(1);
		newtimetrackingtoinsert=newdatabase;
	//alert(newdatabase);
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
      db.transaction(QuerytoinsertTimeTrackingPM, errorCB);
	
}

function QuerytoinsertTimeTrackingPM(tx)
{
	//alert("deleteoldrecords");
	$("#progressMessage").html("Deleting old records");
		pbar.setValue(2);
	tx.executeSql("DELETE FROM TIMETRACKING");
	//ready to insert new records
	//alert("Insert new data GetCoursesdata");
	$("#progressMessage").html("Ready to insert new records");
	var query;
	var obj = jQuery.parseJSON(newtimetrackingtoinsert.TimeTracking);
	//alert("Items "+obj.length);
	var itemcount=0;
	 try
	 {
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
		 alert(error);
		 $("#progressMessage").html("Error updating TimeTracking "+error);
			pbar.setValue(30);
		 
	 }
	 
	
		 
	 $("#progressMessage").html("TimeTracking updated");
		pbar.setValue(100);

	$("#progressMessage").html("");
		pbar.setValue(100);
		ExecutePostLogModal();
}

function ExecutePostLogModal()
{
	$("#progressMessage").html("Submitted Hours ready to send");
	pbar.setValue(20);	
	var ipserver=$("#ipsync").val();
	var obj = {};
	obj['SubmittedHours'] =JSON.stringify(sendHoursalone); 
	$("#progressheader").html("Uploading Data...");
	$("#progressMessage").html("Preparing data to send");
	pbar.setValue(30);
		 $.ajax({
                    type: 'POST',
                   // url: 'http://192.168.1.129/test/serviceFt.asmx//SetDeviceDataarray',
				    url: ipserver+'//SetSubmmitedHours',
                    data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						if(response.d=="success")
						{
							pbar.setValue(100);
							UpdateLogbookModalSync();
						}
						
           
                      
                    },
                    error: function (xmlHttpRequest, textStatus, errorThrown) {
					$("#progressheader").html("Can not connect to server");
							$("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
							alert("error");
							 setTimeout(function () { $(':mobile-pagecontainer').pagecontainer('change', '#pageLogbook', {
        											transition: 'slidedown',
        											changeHash: false,
       												reverse: true,
       												showLoadMsg: true
    												}); }, 12000);
					
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
                });

}

function UpdateLogbookModalSync()
{
	$("#progressheader").html("Connecting...");
		$("#progressMessage").html("Waiting for server connection");
		pbar.setValue(0);
	var ipserver=$("#ipsync").val();
	var obj = {};
	if(!!sessionStorage.userid)
	{
	  obj['UserID'] =sessionStorage.userid;
	}
	else
	{
	 obj['UserID'] ="";
	}
	            $.ajax({
                    type: 'POST',
				    url:ipserver+'//GetSubmittedHours',
					data: JSON.stringify(obj),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
						$("#progressMessage").html("Data downloaded");
						pbar.setValue(100);
						InsertDatabaseSubmitHoursLogModal(response.d);
                    },
            error: function (xmlHttpRequest, textStatus, errorThrown) {
					$("#progressheader").html("Can not connect to server");
							$("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
							 setTimeout(function () { $(':mobile-pagecontainer').pagecontainer('change', '#pageLogbook', {
        											transition: 'slidedown',
        											changeHash: false,
       												reverse: true,
       												showLoadMsg: true
    												}); }, 12000);
                    console.log(xmlHttpRequest.responseXML);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
                });	
}

function InsertDatabaseSubmitHoursLogModal(newdatabase)
{
	$("#progressheader").html("Connected");
	$("#progressMessage").html("Successful connection");
	pbar.setValue(70);
	newhoursdatatoinsert=newdatabase;
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QuerytoinsertModalLogbook, errorCB);
	
}

function QuerytoinsertModalLogbook(tx)
{
	$("#progressMessage").html("Insert New data");
	var idusera=sessionStorage.userid;	
	if(!!sessionStorage.userid)
	{
		//alert("Deleting "+idusera);
		tx.executeSql("DELETE FROM SUBMITTEDHOURS WHERE UserID='"+idusera+"'");
	}
	var query;
	var obj = jQuery.parseJSON(newhoursdatatoinsert.SubmittedHours);
	var itemcount=0;
	var cuantos=obj.length;
		 try
		 {
    $.each(obj, function (key, value) {
		query='INSERT INTO SUBMITTEDHOURS (SubmitID,UserID,Type,Status,SubmitDate,EntryDate,Task,LevelNum,Item,Hours,Mins,PersonnelID,SupervisorID,RejectReason,ReviewDate,Sync) VALUES ("'+escapeDoubleQuotes(value.SubmitID)+'", "'+escapeDoubleQuotes(value.UserID)+'", "'+escapeDoubleQuotes(value.Type)+'", "'+escapeDoubleQuotes(value.Status)+'", "'+value.SubmitDate+'", "'+value.EntryDate+'", "'+escapeDoubleQuotes(value.Task)+'", "'+value.LevelNum+'", "'+escapeDoubleQuotes(value.Item)+'", "'+value.Hours+'", "'+value.Mins+'", "'+value.PersonnelID+'", "'+value.SupervisorID+'", "'+value.RejectReason+'", "'+value.ReviewDate+'","yes")';
		tx.executeSql(query);
		itemcount++;		
		if(itemcount==cuantos)
		{
			pbar.setValue(100);
		$("#progressheader").html("Sync completed");
		setTimeout( function(){ 
	 	$(':mobile-pagecontainer').pagecontainer('change', '#pageLogbook', {
 	 	transition: 'flip',
		changeHash: false,
		reverse: true,
		showLoadMsg: true
		});
	}, 3000 );
			
		}
     });
	 }
	 catch(error)
	 {
		 $("#progressMessage").html("Error updating Submitted Hours "+error);
		 alert(error);
	 }

}

///SUMMARY

function GetOJTOverall()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryOJTOverall, errorCB);	
}

function QueryOJTOverall(tx)
{
	var currentuserlocation=sessionStorage.location;
	var querytosend="SELECT DUTIES2TASKS.Duty, SUM(Tasks.ReqHrsOJT) as Suma FROM DUTIES2TASKS INNER JOIN TASKS ON DUTIES2TASKS.TaskID=TASKS.Name WHERE DUTIES2TASKS.Location='"+currentuserlocation+"' GROUP BY DUTIES2TASKS.Duty";
	tx.executeSql(querytosend, [], QueryOJTOverallSuccess, errorCB);

}

function QueryOJTOverallSuccess(tx,results)
{	
	QuerySubOjt(results);
}

function QuerySubOjt(resultados)
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(function(tx){ RQuerySubOjt(tx,resultados)}, errorCB);
}
function RQuerySubOjt(tx,resultados)
{
	var idusera=sessionStorage.userid;
	var query="SELECT DUTIES2TASKS.Duty,SUM(SUBMITTEDHOURS.Hours) as suma, SUM(SUBMITTEDHOURS.Mins) as smins FROM SUBMITTEDHOURS  INNER JOIN DUTIES2TASKS ON SUBMITTEDHOURS.Task=DUTIES2TASKS.TaskID WHERE SUBMITTEDHOURS.Type='O' AND SUBMITTEDHOURS.UserID='"+idusera+"' AND (SUBMITTEDHOURS.Status='Modified' OR SUBMITTEDHOURS.Status='Approved')  GROUP BY Duty ORDER By DUTIES2TASKS.Duty";
	tx.executeSql(query,[],function(tx,results){ RQuerySubOjtSuccess(tx,results,resultados) }, errorCB);	
}

function RQuerySubOjtSuccess(tx,results,resultados)
{
	var len= results.rows.length;
	var lentwo= resultados.rows.length;
	var sumahrs=0;
	var minshrs=0;
	var totalminsh=0;
	var totalfix=0;
	var togo=0;
	var perresult =0;
	var tb = $('#body-ojtsummary');
	var tablehtml="";
	try
	{
		for (var i=0; i<lentwo; i++){
			sumahrs=0;
			minshrs=0;
			totalminsh=0;
			togo=0;
			for (var t=0; t<len; t++){
			  if(results.rows.item(t).Duty==resultados.rows.item(i).Duty)
			  {
				
				  sumahrs+=results.rows.item(t).suma;
				  minshrs+=results.rows.item(t).smins;
			  }
			}
			if(minshrs>0)
			{
		 	 totalminsh=parseFloat(minshrs)*(1/60);
			}
			totalfix=parseFloat(sumahrs)+parseFloat(totalminsh);
			togo=parseFloat(resultados.rows.item(i).Suma)-parseFloat(totalfix);
			perresult = (parseFloat(totalfix) / parseFloat(resultados.rows.item(i).Suma)) * 100;
			if(perresult==100)
			{
				tablehtml+='<tr data-name="'+resultados.rows.item(i).Duty+'"><td class="colorverde" align="center">'+resultados.rows.item(i).Duty+'</td><td class="colorverde" align="center">'+resultados.rows.item(i).Suma+'</td><td class="colorverde" align="center">'+totalfix+'</td><td class="colorverde" align="center">'+togo+'</td><td class="colorverde" align="center">'+perresult.toFixed(2)+'</td></tr>';

			}
			else
			{
				tablehtml+='<tr data-name="'+resultados.rows.item(i).Duty+'"><td class="colorrojo" align="center">'+resultados.rows.item(i).Duty+'</td><td class="colorrojo" align="center">'+resultados.rows.item(i).Suma+'</td><td class="colorrojo" align="center">'+totalfix+'</td><td class="colorrojo" align="center">'+togo+'</td><td class="colorrojo" align="center">'+perresult.toFixed(2)+'</td></tr>';

			}
			
			tb.empty().append(tablehtml);
			$("#table-ojtsummary").table("refresh");
			$("#table-ojtsummary").trigger('create');

	}

	}
	catch(error)
	{
		alert(error);
	}
}

function GetOJTOverallModal()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryOJTOverallModal, errorCB);	
}

function QueryOJTOverallModal(tx)
{
	var ojtvar=$("#idojtselected").val();
	var currentuserlocation=sessionStorage.location;
	var querytosend="SELECT DUTIES2TASKS.Duty,Tasks.ReqHrsOJT,Tasks.Name FROM DUTIES2TASKS INNER JOIN TASKS ON DUTIES2TASKS.TaskID=TASKS.Name  WHERE DUTIES2TASKS.Duty='"+ojtvar+"' AND DUTIES2TASKS.Location='"+currentuserlocation+"' ORDER By Duties2Tasks.OrdNum";
	tx.executeSql(querytosend, [], QueryOJTOverallSuccessModal, errorCB);
}

function QueryOJTOverallSuccessModal(tx,results)
{	
	QuerySubOjtModal(results);
}

function QuerySubOjtModal(resultados)
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(function(tx){ RQuerySubOjtModal(tx,resultados)}, errorCB);
}
function RQuerySubOjtModal(tx,resultados)
{
	var idusera=sessionStorage.userid;
	var ojtvar=$("#idojtselected").val();
	var query="SELECT DUTIES2TASKS.Duty,SUBMITTEDHOURS.Task, SUBMITTEDHOURS.Hours, SUBMITTEDHOURS.Mins FROM SUBMITTEDHOURS  INNER JOIN DUTIES2TASKS ON SUBMITTEDHOURS.Task=DUTIES2TASKS.TaskID WHERE SUBMITTEDHOURS.Type='O' AND SUBMITTEDHOURS.UserID='"+idusera+"' AND  (SUBMITTEDHOURS.Status='Modified' OR SUBMITTEDHOURS.Status='Approved') AND DUTIES2TASKS.Duty='"+ojtvar+"' ORDER By DUTIES2TASKS.Duty";
	tx.executeSql(query,[],function(tx,results){ RQuerySubOjtSuccessModal(tx,results,resultados) }, errorCB);	
}

function RQuerySubOjtSuccessModal(tx,results,resultados)
{
	var len= results.rows.length;
	var lentwo= resultados.rows.length;
	var tb = $('#body-taskojt');
	var tablehtml="";
	var taskname="";
	var sumahrs=0;
	var minshrs=0;
	var totalminsh=0;
	var totalfix=0;
	var togo=0;
	var perresult =0;
	try
	{
		for (var i=0; i<lentwo; i++){
			sumahrs=0;
			minshrs=0;
			totalminsh=0;
			togo=0;
			for (var t=0; t<len; t++){
				if(results.rows.item(t).Task==resultados.rows.item(i).Name)
				{
					sumahrs+=results.rows.item(t).Hours;
					minshrs+=results.rows.item(t).Mins;
				
				}
			 
			}
			if(minshrs>0)
			{
		 	 totalminsh=parseFloat(minshrs)*(1/60);
			}
			taskname=resultados.rows.item(i).Name;
			totalfix=parseFloat(sumahrs)+parseFloat(totalminsh);
			togo=parseFloat(resultados.rows.item(i).ReqHrsOJT)-parseFloat(totalfix);
			perresult = (parseFloat(totalfix) / parseFloat(resultados.rows.item(i).ReqHrsOJT)) * 100;
			if(perresult==100)
			{
				tablehtml+='<tr><td class="colorverde" align="center">'+taskname+'</td><td class="colorverde" align="center">'+resultados.rows.item(i).ReqHrsOJT+'</td><td class="colorverde" align="center">'+totalfix+'</td><td class="colorverde" align="center">'+togo+'</td><td class="colorverde" align="center">'+perresult.toFixed(2)+'</td></tr>';
			}
			else
			{
				tablehtml+='<tr><td class="colorrojo" align="center">'+taskname+'</td><td class="colorrojo" align="center">'+resultados.rows.item(i).ReqHrsOJT+'</td><td class="colorrojo" align="center">'+totalfix+'</td><td class="colorrojo" align="center">'+togo+'</td><td class="colorrojo" align="center">'+perresult.toFixed(2)+'</td></tr>';
			
			}
			
			tb.empty().append(tablehtml);
			$("#table-taskojt").table("refresh");
			$("#table-taskojt").trigger('create');
			$("#popupdetailojt").popup("reposition", {
				y: 0 /* move it to top */
			  });
			$("#popupdetailojt").popup("open");

	}

	}
	catch(error)
	{
		alert(error);
	}
}


function GetRTIOverall()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryRTIOverall, errorCB);	
}

function QueryRTIOverall(tx)
{
	var currentuserlocation=sessionStorage.location;
	var querytosend="SELECT Levels.LevelNum,Levels.ReqHrsRTI FROM Levels WHERE Levels.Location='"+currentuserlocation+"'";
	tx.executeSql(querytosend, [], QueryRTIOverallSuccess, errorCB);	
}

function QueryRTIOverallSuccess(tx,results)
{
	//QuerySubRTI(results);
	Overalltrackingcourse(results);
}

//Search in Timetracking
function Overalltrackingcourse(resultlevels)
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(function(tx){ QueryOveralltracking(tx,resultlevels)}, errorCB);	

}

function QueryOveralltracking(tx,resultlevels)
{
	var ItemSelected=$("#select_itemsworkedon").val();
	var iduser=sessionStorage.userid;
	var leveluser=sessionStorage.lvlname;
	var query="SELECT TimeTracking.TotalTime, Items.Item,Levels2Items.LevelNum FROM Items INNER JOIN TimeTracking on Items.CourseID=TimeTracking.ContentID INNER JOIN Levels2Items on Items.Item=Levels2Items.ID WHERE TimeTracking.UserID='"+iduser+"'";
	tx.executeSql(query, [],function(tx,results){ QueryOveralltrackingSuccess(tx,results,resultlevels) }, errorCB);	
}

function QueryOveralltrackingSuccess(tx,results,resultlevels)
{
	QuerySubRTI(resultlevels,results)
}


function QuerySubRTI(resultlevels,resultstime)
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(function(tx){ RQuerySubRTI(tx,resultlevels,resultstime)}, errorCB);
}
function RQuerySubRTI(tx,resultlevels,resultstime)
{
	var idusera=sessionStorage.userid;
	var query="SELECT SubmittedHours.LevelNum,SubmittedHours.Item,SUM(SubmittedHours.Hours) as hours, Sum(SubmittedHours.Mins) as mins FROM SubmittedHours WHERE SubmittedHours.Type='C' AND UserID='"+idusera+"' GROUP BY LevelNum";
	tx.executeSql(query, [],function(tx,results){ RQuerySubRTISuccess(tx,results,resultlevels,resultstime) }, errorCB);	
}

function RQuerySubRTISuccess(tx,results,resultados,resultres)
{
	var len= results.rows.length;
	var lentwo= resultados.rows.length;
	var lenthree=resultres.rows.length;
	//alert(len+" "+lentwo+" "+lenthree);
	var sumahrs=0;
	var minshrs=0;
	var totalminsh=0;
	var totalfix=0;
	var togo=0;
	var perresult =0;
	var tb = $('#body-classsummary');
	var tablehtml="";
	var coursehrs=0;
	try
	{
		for (var i=0; i<lentwo; i++){
			sumahrs=0;
			minshrs=0;
			totalminsh=0;
			togo=0;
			coursehrs=0;
			for (var t=0; t<len; t++){
			  if(results.rows.item(t).LevelNum==resultados.rows.item(i).LevelNum)
			  {
				//alert(results.rows.item(t).LevelNum+" "+results.rows.item(t).hours+":"+results.rows.item(t).mins+"item = "+results.rows.item(t).Item);
				  sumahrs+=results.rows.item(t).hours;
				  minshrs+=results.rows.item(t).mins;
			  }
			}
			for (var w=0; w<lenthree; w++){
				//alert(resultres.rows.item(w).LevelNum+"es igual a"+resultados.rows.item(i).LevelNum);
				if(resultres.rows.item(w).LevelNum==resultados.rows.item(i).LevelNum)
				{
					//alert(resultres.rows.item(w).TotalTime);
					coursehrs=parseFloat(coursehrs)+parseFloat(resultres.rows.item(w).TotalTime);
					
				}

			}
		
		    //alert(coursehrs);
			coursehrs=parseFloat(coursehrs)/3600;
			//alert(coursehrs);
			if(minshrs>0)
			{
		 	 totalminsh=parseFloat(minshrs)*(1/60);
			}
			totalfix=parseFloat(sumahrs)+parseFloat(totalminsh)+parseFloat(coursehrs);
			totalfix=parseFloat(totalfix).toFixed(2);
			togo=parseFloat(resultados.rows.item(i).ReqHrsRTI)-parseFloat(totalfix);
			togo=parseFloat(togo).toFixed(2);
			perresult = (parseFloat(totalfix) / parseFloat(resultados.rows.item(i).ReqHrsRTI)) * 100;
			if(perresult==100)
			{
				tablehtml+='<tr data-name="'+resultados.rows.item(i).LevelNum+'"><td class="colorverde" align="center">'+resultados.rows.item(i).LevelNum+'</td><td class="colorverde" align="center">'+resultados.rows.item(i).ReqHrsRTI+'</td><td class="colorverde" align="center">'+totalfix+'</td><td class="colorverde" align="center">'+togo+'</td><td class="colorverde" align="center">'+perresult.toFixed(2)+'</td></tr>';

			}
			else
			{
				tablehtml+='<tr data-name="'+resultados.rows.item(i).LevelNum+'"><td class="colorrojo" align="center">'+resultados.rows.item(i).LevelNum+'</td><td class="colorrojo" align="center">'+resultados.rows.item(i).ReqHrsRTI+'</td><td class="colorrojo" align="center">'+totalfix+'</td><td class="colorrojo" align="center">'+togo+'</td><td class="colorrojo" align="center">'+perresult.toFixed(2)+'</td></tr>';

			}
			
			tb.empty().append(tablehtml);
			$("#table-classsummary").table("refresh");
			$("#table-classsummary").trigger('create');
			
		}

	}
	catch(error)
	{
		alert(error);
	}	

}
function GetRTIOverallModal()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryRTIOverallModalx, errorCB);	
}

function QueryRTIOverallModalx(tx)
{
	var classid=$("#idclassselected").val();
	var currentuserlocation=sessionStorage.location;
	var querytosend="SELECT LevelNum,ID,Location FROM Levels2Items WHERE  Levels2Items.LevelNum='"+classid+"' AND Levels2Items.Location='"+currentuserlocation+"'";
	tx.executeSql(querytosend, [], QueryRTIOverallSuccessModalx, errorCB);	
}
function QueryRTIOverallSuccessModalx(tx,results)
{
	QuerySubRTITIMEModalx(results);
}
function QuerySubRTITIMEModalx(resultlevels)
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(function(tx){ QueryOverallTIMEMODal(tx,resultlevels)}, errorCB);	

}

function QueryOverallTIMEMODal(tx,resultlevels)
{
	var iduser=sessionStorage.userid;
	var leveluser=sessionStorage.lvlname;
	var query="SELECT TimeTracking.TotalTime, Items.Item,Levels2Items.LevelNum FROM Items INNER JOIN TimeTracking on Items.CourseID=TimeTracking.ContentID INNER JOIN Levels2Items on Items.Item=Levels2Items.ID WHERE TimeTracking.UserID='"+iduser+"'";
	tx.executeSql(query, [],function(tx,results){ QueryOveralltrackingSuccessModalx(tx,results,resultlevels) }, errorCB);
}

function QueryOveralltrackingSuccessModalx(tx,results,resultlevels)
{
	QuerySubRTIModalx(resultlevels,results)
}


function QuerySubRTIModalx(resultlevels,resultstime)
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(function(tx){ RQuerySubRTIxModal(tx,resultlevels,resultstime)}, errorCB);
}

function RQuerySubRTIxModal(tx,resultlevels,resultstime)
{
	var idusera=sessionStorage.userid;
	var classid=$("#idclassselected").val();
	var query="SELECT SubmittedHours.LevelNum, SubmittedHours.Hours as hours, SubmittedHours.Mins as mins, SubmittedHours.Item FROM SubmittedHours WHERE SubmittedHours.Type='C' AND UserID='"+idusera+"'";
	tx.executeSql(query, [],function(tx,results){ RQuerySubRTISuccessModalx(tx,results,resultlevels,resultstime) }, errorCB);
}



function RQuerySubRTISuccessModalx(tx,results,resultados,resultatres)
{
	var len= results.rows.length; //submittedhours
	var lentwo= resultados.rows.length;// Levelitems
	var lenthree=resultatres.rows.length;
	//alert(len+" "+lentwo+" "+lenthree);
	var sumahrs=0;
	var minshrs=0;
	var totalminsh=0;
	var totalfix=0;
	var togo=0;
	var perresult =0;
	var tb = $('#body-classdetail');
	var tablehtml="";
	var namesx="";
	var coursehrs=0;
	try
	{
		for (var i=0; i<lentwo; i++){
			sumahrs=0;
			minshrs=0;
			totalminsh=0;
			togo=0;
			coursehrs=0;
			namesx="";
			for (var t=0; t<len; t++){
			  if(results.rows.item(t).Item==resultados.rows.item(i).ID)
			  {
				
				  sumahrs+=results.rows.item(t).hours;
				  minshrs+=results.rows.item(t).mins;
				  
			  }
			}

			namesx=resultados.rows.item(i).ID;
			for (var w=0; w<lenthree; w++){
				//alert(resultres.rows.item(w).LevelNum+"es igual a"+resultados.rows.item(i).LevelNum);
				if(resultatres.rows.item(w).Item==resultados.rows.item(i).ID)
				{
					//alert(resultres.rows.item(w).TotalTime);
					coursehrs=parseFloat(coursehrs)+parseFloat(resultatres.rows.item(w).TotalTime);
					
				}

			}
			coursehrs=parseFloat(coursehrs)/3600;
			
			if(minshrs>0)
			{
		 	 totalminsh=parseFloat(minshrs)*(1/60);
			}
			totalfix=parseFloat(sumahrs)+parseFloat(totalminsh)+parseFloat(coursehrs);
			totalfix=parseFloat(totalfix).toFixed(2);
			tablehtml+='<tr><td class="colorrojo" align="center">'+ namesx+'</td><td class="colorrojo" align="center">'+totalfix+'</td></tr>';	
			tb.empty().append(tablehtml);
			$("#table-classdetail").table("refresh");
			$("#table-classdetail").trigger('create');
			$("#popupdetailclass").popup("reposition", {
				y: 0 /* move it to top */
			  });
			$("#popupdetailclass").popup("open");
	}

	}
	catch(error)
	{
		alert(error);
	}	
}

//START SUBMISSIONS
function GetSubmissions()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QuerySubmissions, errorCB);	
}

function QuerySubmissions(tx)
{
	var options=$("#select_Submission").val();
	var idusera=sessionStorage.userid;
	var query="SELECT SubmitID,EntryDate,Hours,Mins,Type,Status,ReviewDate FROM SubmittedHours WHERE UserID='"+idusera+"'";
	if(options=="Submitted")
	{
		query+=" AND Status='Submitted' ";

	}
	else if(options=="Approved")
	{
		query+=" AND Status='Approved' ";

	}
	else if(options=="Modified")
	{
		query+=" AND Status='Modified' ";

	}
	else if(options=="Rejected")
	{
		query+=" AND Status='Rejected' ";

	}
	//alert(query);
	query+=" ORDER BY EntryDate";
	tx.executeSql(query, [], QuerySubmissionsSuccess, errorCB);

}

function QuerySubmissionsSuccess(tx,results)
{
	var len= results.rows.length;
	var tb = $('#body-submissions');
	var tablehtml="";
	var entrydate="";
	var hoursandmins="";
	var entrytype="";
	var refe="";
	for (var t=0; t<len; t++){
		if(results.rows.item(t).Type=="O")
		{
			entrytype="OJT";

		}
		else
		{
			entrytype="RTI";
		}
		//alert
		if(results.rows.item(t).ReviewDate=="null" || results.rows.item(t).ReviewDate=="1900-01-01 00:00:00" || results.rows.item(t).ReviewDate=="")
		{
			refe="";
		}
		else
		{
			refe=ShowFormatDate(results.rows.item(t).ReviewDate);
		}
		if(parseFloat(results.rows.item(t).Mins)<=9)
		{
			//alert("menor");
			hoursandmins=results.rows.item(t).Hours+":0"+results.rows.item(t).Mins;
		}
		else
		{
			if(results.rows.item(t).Mins!="")
			{
				hoursandmins=results.rows.item(t).Hours+":"+results.rows.item(t).Mins;

			}
			else
			{
				hoursandmins=results.rows.item(t).Hours+":"+"00";
			}
			

		}
	
		tablehtml+='<tr data-name="'+results.rows.item(t).SubmitID+'"><td align="center">'+ShowFormatDate(results.rows.item(t).EntryDate)+'</td><td align="center">'+hoursandmins+'</td><td align="center">'+entrytype+'</td><td align="center">'+ results.rows.item(t).Status+'</td><td align="center">'+refe+'</td></tr>';	
	}
	tb.empty().append(tablehtml);
	$("#table-submissions").table("refresh");
	$("#table-submissions").trigger('create');

}

function Getinfosubmittedrow()
{
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(Queryinfosubmittedrow, errorCB);

}

function Queryinfosubmittedrow(tx)
{
	var idsubmitrow=$('#idsubrow').val();
	//alert(idsubmitrow);
	var query="SELECT * FROM SubmittedHours WHERE SubmitID='"+idsubmitrow+"'";
	//alert(query);
	tx.executeSql(query, [], infosubmittedrowSuccess, errorCB);

}

function infosubmittedrowSuccess(tx,results)
{
	var len=results.rows.length;
	var tb = $('#bdonerow');
	var tbt = $('#bdtworow');
	var tbth = $('#bdthreerow');
	var htmltbo="";
	var htmltbt="";
	var htmltbth="";
	var minss="";
	var hoursandmins="";
	var refe="";
	//alert("vavers");
	if(len>0)
	{
		try
		{
			var typeofs="";
		var itemtask="";
		if(results.rows.item(0).Type=="O")
		{
			typeofs="OJT";
			itemtask=results.rows.item(0).Task;
		}
		else
		{
			typeofs="RTI";
			itemtask=results.rows.item(0).Item;
		}
		//alert("comprar fecha; "+results.rows.item(0).ReviewDate);
		if(results.rows.item(0).ReviewDate=="null" || results.rows.item(0).ReviewDate=="1900-01-01 00:00:00")
		{
			refe="";
		}
		else
		{
			refe=ShowFormatDate(results.rows.item(0).ReviewDate);
		}
		if(parseFloat(results.rows.item(0).Mins)<=9)
		{
			//alert("menor");
			hoursandmins=results.rows.item(0).Hours+":0"+results.rows.item(0).Mins;
		}
		else
		{
			hoursandmins=results.rows.item(0).Hours+":"+results.rows.item(0).Mins;

		}
        var rrreason="";
		if(results.rows.item(0).RejectReason=="null")
		{
			rrreason=""

		}
		else{
			rrreason=results.rows.item(0).RejectReason;
		}
		//alert("horas y minutos: "+results.rows.item(0).Mins);
		
		htmltbo='<tr><td id="rowentrydate">'+ShowFormatDate(results.rows.item(0).EntryDate)+'</td><td id="rowsubmitdate">'+ShowFormatDate(results.rows.item(0).SubmitDate)+'</td><td id="rowtype">'+typeofs+'</td><td id="rowpersonnel"></td></tr>';
		htmltbt='<tr><td id="rowhrmin">'+hoursandmins+'</td><td id="rowstatus">'+results.rows.item(0).Status+'</td><td id="rowreview">'+refe+'</td><td id="rowsupervisor"></td></tr>';
		htmltbth='<tr><td id="rowtaskitem">'+itemtask+'</td><td id="rowreason">'+rrreason+'</td></tr>';
		tb.empty().append(htmltbo);
		$("#my-tableo").table("refresh");
		$("#my-tableo").trigger('create');
		tbt.empty().append(htmltbt);
		$("#my-tablet").table("refresh");
		$("#my-tablet").trigger('create');
		tbth.empty().append(htmltbth);
		$("#my-tabletr").table("refresh");
		$("#my-tabletr").trigger('create');
		FillNameByID(results.rows.item(0).SupervisorID);
		FillNameByIDP(results.rows.item(0).PersonnelID);

		}
		catch(error)
		{
			alert(error);
		}
		

	}

}

function FillNameByID(iduser)
{
	$("#idsupervisorname").val(iduser);
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(function(tx){ QueryFillNameID(tx,iduser)}, errorCB);

}

function QueryFillNameID(tx,iduser)
{
	var query="SELECT USERS.FirstName, USERS.LastName, Users.Username FROM USERS WHERE USERS.Username='"+iduser+"'";
	tx.executeSql(query, [],function(tx,results){ QueryFillNameIDSuccess(tx,results,iduser) }, errorCB);	
}

function QueryFillNameIDSuccess(tx,results,iduser)
{
	var len=results.rows.length;
	if(len>0)
	{
		//alert(results.rows.item(0).LastName+', '+results.rows.item(0).FirstName);
		$("#rowsupervisor").empty().append(results.rows.item(0).LastName+', '+results.rows.item(0).FirstName);
		$("#idsupervisorfname").val(results.rows.item(0).LastName+', '+results.rows.item(0).FirstName);
		$("#my-tablet").table("refresh");
		//return results.rows.item(0).LastName+', '+results.rows.item(0).FirstName;
	}
}

function FillNameByIDP(iduser)
{
	
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(function(tx){ QueryFillNameIDP(tx,iduser)}, errorCB);

}

function QueryFillNameIDP(tx,iduser)
{
	var query="SELECT USERS.FirstName, USERS.LastName, Users.Username FROM USERS WHERE USERS.Username='"+iduser+"'";
	tx.executeSql(query, [],function(tx,results){ QueryFillNameIDSuccessP(tx,results,iduser) }, errorCB);	
}

function QueryFillNameIDSuccessP(tx,results,iduser)
{
	var len=results.rows.length;
	if(len>0)
	{
		//alert(results.rows.item(0).LastName+', '+results.rows.item(0).FirstName);
		$("#rowpersonnel").empty().append(results.rows.item(0).LastName+', '+results.rows.item(0).FirstName);
		$("#my-tableo").table("refresh");
		//return results.rows.item(0).LastName+', '+results.rows.item(0).FirstName;
	}
}
function sendtosupervisor()
{
	var iduser=$("#idsupervisorname").val();
	var userfullname=$("#idsupervisorfname").val();
	$("#FromH").val(iduser);
	$("#FromHName").val(userfullname);
	OpenSendMessage("5");
	
}

