function gotowpinspections()
{
    var leveltocheck=sessionStorage.lvltype;
    if(leveltocheck=="9 - Trainee")
    {
         $(':mobile-pagecontainer').pagecontainer('change', '#pageworkplace', {
         transition: 'pop',
         changeHash: false,
         reverse: true,
         showLoadMsg: true
         });
    }
    else
    {
        $(':mobile-pagecontainer').pagecontainer('change', '#pageInspections', {
            transition: 'pop',
            changeHash: false,
            reverse: true,
            showLoadMsg: true
            });

    }

}

$(document).on( 'pagebeforeshow', '#pageInspections',function(){
   // Supervisorofme();
   var leveltocheck=sessionStorage.lvltype;
   if(leveltocheck=="9 - Trainee")
   {
        $(':mobile-pagecontainer').pagecontainer('change', '#pageworkplace', {
        transition: 'pop',
        changeHash: false,
        reverse: true,
        showLoadMsg: true
        });
   }
   else
   {
    GetQuantNewInspections();   
    $("#mlpid").val("0");
    CheckSupervisorSafe();
    $('#table-psafety').on('click','tr', function() {
        $('#proceduresbodysafety tr').css({background: 'transparent'});
		$('#proceduresbodysafety tr').css({color: 'black'});
        $(this).css({background: 'blue'});
		$(this).css({color: 'white'});
        var idrow=$(this).attr('data-name');
        $("#mlpid").val(idrow);
		$("#headtablesafety").addClass("ui-bar-c");
	 $("#table-psafety").table("refresh");
	 $("#table-psafety").trigger('create');
	
    });
   

   }

});

$(document).on( 'pagebeforeshow', '#pageworkplace',function(){
    $("#btnStwo").addClass("buttonInspection");
    $("#btnSone").addClass("buttonInspection");
    $("#btnSthree").addClass("buttonInspection");
    $("#btnRone").addClass("buttonInspection");
    $("#btnRtwo").addClass("buttonInspection");
    $("#btnRthree").addClass("buttonInspection");
    $("#workplaceone").val("");
    $("#workplacetwo").val("");
    $("#workplacethree").val("");
    $("#workplacefour").val("");
    $("#workplacefive").val("");
    $("#workplacesix").val("");
    $("#workplaceseven").val("");
    $("#workplaceeight").val("");
    $("#workplacenine").val("");
    $("#shiftworkp").val("Select");
    $('#shiftworkp').selectmenu('refresh');
    $('#shiftworkp').selectmenu('refresh', true);

   
});

$(document).on( 'pagebeforeshow', '#pageworkplaceread',function(){
    //alert("entro");
    FillReadWorkPlaceR();

});

$(document).on( 'pagebeforeshow', '#pagesafetycontact',function(){
    $("#chkinsone").prop('checked',false).checkboxradio('refresh');
    $("#chkinsonet").prop('checked',false).checkboxradio('refresh');
    $("#chkinstwo").prop('checked',false).checkboxradio('refresh');
    $("#chkinstwot").prop('checked',false).checkboxradio('refresh');
    $("#chkinsthree").prop('checked',false).checkboxradio('refresh');
    $("#chkinsthreet").prop('checked',false).checkboxradio('refresh');
    $("#chkinsfour").prop('checked',false).checkboxradio('refresh');
    $("#chkinsfourt").prop('checked',false).checkboxradio('refresh');
    $("#chkinsfive").prop('checked',false).checkboxradio('refresh');
    $("#chkinsfivet").prop('checked',false).checkboxradio('refresh');
    $("#textarea-inscomments").val("");
    $("#textarea-insfollow").val("");
    $("#textarea-insemp").val("");
    $("#textarea-instopics").val("");
    
   
});


function CheckSupervisorSafe()
{
  
    var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QuerytoCheckSupervisor,errorCBPA);
}

function QuerytoCheckSupervisor(tx)
{
 
    var UserIDx=sessionStorage.userid;
    var querys="SELECT SUBMITTEDWPIS.SubmitID,SUBMITTEDWPIS.EmpDate, USERS.FirstName,USERS.LastName FROM SUBMITTEDWPIS INNER JOIN USERS ON SUBMITTEDWPIS.UserID=USERS.Username  WHERE SupID='"+UserIDx+"' AND Status='R' ORDER BY SUBMITTEDWPIS.EmpDate";
    //var querys="SELECT * FROM SUBMITTEDWPIS";
    //alert(querys);
    tx.executeSql(querys, [], QuerytoCheckSupervisorSuccess,errorCBPA);
}

function QuerytoCheckSupervisorSuccess(tx,results)
{
    var len=results.rows.length;
   // alert(len);
    var tb = $('#proceduresbodysafety');
    var tablehtml="";
    for (var i=0; i<results.rows.length; i++){
        tablehtml+='<tr data-name="'+results.rows.item(i).SubmitID+'"><td>'+results.rows.item(i).LastName+', '+results.rows.item(i).FirstName+'</td><td>'+ShowFormatDateTime(results.rows.item(i).EmpDate)+'</td></tr>';
    }
    tb.empty().append(tablehtml);
	$("#table-psafety").table("refresh");
	$("#table-psafety").trigger('create');

}

function gotoinspect()
{
    var idins=$("#mlpid").val();
    if(idins=="0")
    {
        navigator.notification.alert("Please Select Inspection", null, 'FieldTracker', 'Accept');

    }
    else
    {
        $(':mobile-pagecontainer').pagecontainer('change', '#pagesafetycontact', {
            transition: 'pop',
            changeHash: false,
            reverse: true,
            showLoadMsg: true
            });
        

    }
    
}

function Supervisorofme()
{
    var Supervisor=sessionStorage.Supervisor;
    if(Supervisor=="null")
    {
        Supervisor="x men";
    }
    alert(Supervisor);

}



function changeones()
{
    var hasgreen=$("#btnSone").hasClass("buttongreens");
    if(hasgreen)
	{
        $("#btnSone").removeClass("buttongreens");
    $("#btnSone").addClass("buttonInspection");

    }
    else
    {
    $("#btnSone").removeClass("buttonInspection");
    $("#btnSone").addClass("buttongreens");
    $("#btnRone").removeClass("buttonreds");
    $("#btnRone").addClass("buttonInspection");

    }
    
   
}

function changeonesrr()
{
    var hasred=$("#btnRone").hasClass("buttonreds");
    if(hasred)
	{
        $("#btnRone").removeClass("buttonreds");
        $("#btnRone").addClass("buttonInspection");

    }
    else
    {
        $("#btnSone").removeClass("buttongreens");
        $("#btnSone").addClass("buttonInspection");
        $("#btnRone").removeClass("buttonInspection");
        $("#btnRone").addClass("buttonreds");

    }
 
}

function changetwos()
{
    var hasgreen=$("#btnStwo").hasClass("buttongreens");
    if(hasgreen)
	{
        $("#btnStwo").removeClass("buttongreens");
    $("#btnStwo").addClass("buttonInspection");

    }
    else
    {
    $("#btnStwo").removeClass("buttonInspection");
    $("#btnStwo").addClass("buttongreens");
    $("#btnRtwo").removeClass("buttonreds");
    $("#btnRtwo").addClass("buttonInspection");

    }
    
   
}

function changetwosrr()
{
    var hasred=$("#btnRtwo").hasClass("buttonreds");
    if(hasred)
	{
        $("#btnRtwo").removeClass("buttonreds");
        $("#btnRtwo").addClass("buttonInspection");

    }
    else
    {
        $("#btnStwo").removeClass("buttongreens");
        $("#btnStwo").addClass("buttonInspection");
        $("#btnRtwo").removeClass("buttonInspection");
        $("#btnRtwo").addClass("buttonreds");

    }
 
}

function changethrees()
{
    var hasgreen=$("#btnSthree").hasClass("buttongreens");
    if(hasgreen)
	{
        $("#btnSthree").removeClass("buttongreens");
    $("#btnSthree").addClass("buttonInspection");

    }
    else
    {
    $("#btnSthree").removeClass("buttonInspection");
    $("#btnSthree").addClass("buttongreens");
    $("#btnRthree").removeClass("buttonreds");
    $("#btnRthree").addClass("buttonInspection");

    }
    
   
}

function changethreesrr()
{
    var hasred=$("#btnRthree").hasClass("buttonreds");
    if(hasred)
	{
        $("#btnRthree").removeClass("buttonreds");
        $("#btnRthree").addClass("buttonInspection");

    }
    else
    {
        $("#btnSthree").removeClass("buttongreens");
        $("#btnSthree").addClass("buttonInspection");
        $("#btnRthree").removeClass("buttonInspection");
        $("#btnRthree").addClass("buttonreds");

    }
 
}

function SaveWorkplace()
{
  var txtone=$("#workplaceone").val();
  var txttwo=$("#workplacetwo").val();
  var txtthree=$("#workplacethree").val();
  var hasred=$("#btnRone").hasClass("buttonreds");
  var hasgreen=$("#btnSone").hasClass("buttongreens");
  var hasredtwo=$("#btnRtwo").hasClass("buttonreds");
  var hasgreentwo=$("#btnStwo").hasClass("buttongreens");
  var hasredthree=$("#btnRthree").hasClass("buttonreds");
  var hasgreenthree=$("#btnSthree").hasClass("buttongreens");
  var shift=$("#shiftworkp").val();
  var goone=false;
  var btnsone=false;
  var btnstwo=false;
  var btnSthree=false;
  var lacuaja=false;
  var lacuajatwo=false;
  var lacuajathree=false;
  //alert("ee: "+txtone.length);
  if(txtone!="" || txttwo!="" || txtthree!="")
  {
      if(txtone!="")
      {
          if(hasred || hasgreen)
          {
              btnsone=true;
          }

      }
      if(txttwo!="")
      {
          if(hasredtwo || hasgreentwo)
          {
            btnstwo=true;
          }

      }
      if(txtthree!="")
      {
          if(hasredthree|| hasgreenthree)
          {
            btnSthree=true;
          }

      }

      if(txtone!="" && btnsone)
      {
          lacuaja=true;
      }
      else if(txtone.length>0 && btnsone==false)
      {
        lacuaja=false;

      }
      else if( txtone.length==0 && btnsone)
      {
        lacuaja=false;

      }
      else
      {
          lacuaja=true;
      }

      if(txttwo!="" && btnstwo)
      {
          lacuajatwo=true;
      }
      else if(txttwo.length>0 && btnstwo==false)
      {
        lacuajatwo=false;

      }
      else if(txttwo.length==0 && btnstwo)
      {
         
        lacuajatwo=false;

      }
      else
      {
          lacuajatwo=true;
      }

      if(txtthree!="" && btnSthree)
      {
          lacuajathree=true;
      }
      else if(txtthree.length>0 && btnSthree==false)
      {
        lacuajathree=false;

      }
      else if(txtthree.length==0 && btnSthree)
      {
        lacuajathree=false;
      }
      else
      {
        lacuajathree=true;
      }

      if(lacuaja && lacuajatwo && lacuajathree)
      {
          if(shift!="Select")
          {
            goone=true;

          }
          else
          {
            navigator.notification.alert("Please select a shift", null, 'FieldTracker', 'Accept');

          }
         
      }
      else
      {
        navigator.notification.alert("Please enter work place and select Safe or At Risk", null, 'FieldTracker', 'Accept');
      }
      


  }
  else
  {
    navigator.notification.alert("Please enter Work Place", null, 'FieldTracker', 'Accept');

  }


  if(goone)
  {
    var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QuerySaveWorkInspection, errorCBPA);

  }
}

  function QuerySaveWorkInspection(tx)
  {
      var dt = new Date();
      var SubmitIDx= sessionStorage.userid+new Date().getTime() + Math.random();
      var EmpDatex=dt.toYMDhrs();
      var Shiftx=$("#shiftworkp").val();
      var UserIDx=sessionStorage.userid;
      var hasred=$("#btnRone").hasClass("buttonreds");
      var hasgreen=$("#btnSone").hasClass("buttongreens");
      var hasredtwo=$("#btnRtwo").hasClass("buttonreds");
      var hasgreentwo=$("#btnStwo").hasClass("buttongreens");
      var hasredthree=$("#btnRthree").hasClass("buttonreds");
      var hasgreenthree=$("#btnSthree").hasClass("buttongreens");
      var Statusx="";
      if(hasred || hasredtwo || hasredthree)
      {
        Statusx="R";
      }
      else
      {
        Statusx="S";
      }
      var Supervisor=sessionStorage.Supervisor;
      if(Supervisor=="null")
        {
        Supervisor="";
        }
      var SupIDx=Supervisor;
      var Wpi1=$("#workplaceone").val();
      var Wpi2=$("#workplacetwo").val();
      var Wpi3=$("#workplacethree").val();
      var Wpi1Status="";
      var Wpi2Status="";
      var Wpi3Status="";
      if(Wpi1!="")
      {
         if(hasred)
         {
            Wpi1Status="R";

         }
         else if(hasgreen){

            Wpi1Status="S";

         }
      }
      if(Wpi2!="")
      {
        if(hasredtwo)
        {
            Wpi2Status="R";

        }
        else if(hasgreentwo){

            Wpi2Status="S";

        }
          
      }
      if(Wpi3!="")
      {
        if(hasredthree)
        {
            Wpi3Status="R";

        }
        else if(hasgreenthree)

            Wpi3Status="S";
        }
         
      
     
  
      var HI1=$("#workplacefour").val();
      var HI2=$("#workplacefive").val();
      var HI3=$("#workplacesix").val();
      var CAT1=$("#workplaceseven").val();
      var CAT2=$("#workplaceeight").val();
      var CAT3=$("#workplacenine").val();
      
    var queryx="INSERT INTO SUBMITTEDWPIS (SubmitID,EmpDate,Shift,UserID,Status,SupID,WPI1,WPI2,WPI3,WPI1Status,WPI2Status,WPI3Status,HI1,HI2,HI3,CAT1,CAT2,CAT3,Sync,SyncTwo) VALUES ('"+SubmitIDx+"','"+EmpDatex+"','"+Shiftx+"','"+UserIDx+"','"+Statusx+"','"+SupIDx+"','"+escapeDoubleQuotes(Wpi1)+"','"+escapeDoubleQuotes(Wpi2)+"','"+escapeDoubleQuotes(Wpi3)+"','"+Wpi1Status+"','"+Wpi2Status+"','"+Wpi3Status+"','"+escapeDoubleQuotes(HI1)+"','"+escapeDoubleQuotes(HI2)+"','"+escapeDoubleQuotes(HI3)+"','"+escapeDoubleQuotes(CAT1)+"','"+escapeDoubleQuotes(CAT2)+"','"+escapeDoubleQuotes(CAT3)+"','no','no')";
    //alert(queryx);
    tx.executeSql(queryx);
    navigator.notification.confirm(
        'Saved',      // mensaje (message)
                onConfirmaxxxy,      // función 'callback' a llamar con el índice del botón pulsado (confirmCallback)
                    'FieldTracker',            // titulo (title)
            'Accept'          // botones (buttonLabels)
            );

  }
  function onConfirmaxxxy(button) {
    opensylenceWpisx();
}

function chkinsonef()
{
    var chkone=$("#chkinsonet").is(':checked') 
    if(chkone)
    {
        $("#chkinsonet").prop('checked',false).checkboxradio('refresh');

    }
}

function chkinsonetf()
{
    var chkone=$("#chkinsone").is(':checked') 
    if(chkone)
    {
        $("#chkinsone").prop('checked',false).checkboxradio('refresh');

    }
}

function chkinstwof()
{
    var chkone=$("#chkinstwot").is(':checked') 
    if(chkone)
    {
        $("#chkinstwot").prop('checked',false).checkboxradio('refresh');

    }
}

function chkinstwotf()
{
    var chkone=$("#chkinstwo").is(':checked') 
    if(chkone)
    {
        $("#chkinstwo").prop('checked',false).checkboxradio('refresh');

    }
}

function chkinsthreef()
{
    var chkone=$("#chkinsthreet").is(':checked') 
    if(chkone)
    {
        $("#chkinsthreet").prop('checked',false).checkboxradio('refresh');

    }
}

function chkinsthreetf()
{
    var chkone=$("#chkinsthree").is(':checked') 
    if(chkone)
    {
        $("#chkinsthree").prop('checked',false).checkboxradio('refresh');

    }
}

function chkinsfourf()
{
    var chkone=$("#chkinsfourt").is(':checked') 
    if(chkone)
    {
        $("#chkinsfourt").prop('checked',false).checkboxradio('refresh');

    }
}

function chkinsfourtf()
{
    var chkone=$("#chkinsfour").is(':checked') 
    if(chkone)
    {
        $("#chkinsfour").prop('checked',false).checkboxradio('refresh');

    }
}

function chkinsfivef()
{
    var chkone=$("#chkinsfivet").is(':checked') 
    if(chkone)
    {
        $("#chkinsfivet").prop('checked',false).checkboxradio('refresh');
    }
}

function chkinsfivetf()
{
    var chkone=$("#chkinsfive").is(':checked') 
    if(chkone)
    {
        $("#chkinsfive").prop('checked',false).checkboxradio('refresh');
    }
}

function SubmitInspection()
{
    var chksone=$("#chkinsone").is(':checked'); 
    var chksonet=$("#chkinsonet").is(':checked');
    var chkstwo=$("#chkinstwo").is(':checked'); 
    var chkstwot=$("#chkinstwot").is(':checked');
    var chksthree=$("#chkinsthree").is(':checked'); 
    var chksthreet=$("#chkinsthreet").is(':checked');
    var chksfour=$("#chkinsfour").is(':checked'); 
    var chksfourt=$("#chkinsfourt").is(':checked');
    var chksfive=$("#chkinsfive").is(':checked'); 
    var chksfivet=$("#chkinsfivet").is(':checked');
    var chkoneconfirm=false;
    var chktwoconfirm=false;
    var chkthreeconfirm=false;
    var chkfourconfirm=false;
    var chkfiveconfirm=false;
    if(chksone || chksonet)
    {
        chkoneconfirm=true;
    }
    if(chkstwo || chkstwot)
    {
        chktwoconfirm=true;
    }
    if(chksthree || chksthreet)
    {
        chkthreeconfirm=true;
    }
    if(chksfour || chksfourt)
    {
        chkfourconfirm=true;
    }
    if(chksfive|| chksfivet)
    {
        chkfiveconfirm=true;
    }
    if(chkoneconfirm && chktwoconfirm && chkthreeconfirm && chkfourconfirm && chkfiveconfirm)
    {
        var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
        db.transaction(QuerySaveRInspection, errorCBPA);
       

    }
    else
    {
        navigator.notification.alert("Please complete answers", null, 'FieldTracker', 'Accept');

    }

}

function QuerySaveRInspection(tx)
{
    var dt = new Date();
    var SubmitIDwpi=$("#mlpid").val();
    var SubDate=dt.toYMDhrs();
    var chksone=$("#chkinsone").is(':checked'); 
    var chkstwo=$("#chkinstwo").is(':checked'); 
    var chksthree=$("#chkinsthree").is(':checked'); 
    var chksfour=$("#chkinsfour").is(':checked'); 
    var chksfive=$("#chkinsfive").is(':checked');
    var ynone="N";
    var yntwo="N";
    var ynthree="N";
    var ynfour="N";
    var ynfive="N";
    if(chksone)
    {
        ynone="Y";

    }
    if(chkstwo)
    {
        yntwo="Y";

    }
    if(chksthree)
    {
        ynthree="Y";

    }
    if(chksfour)
    {
        ynfour="Y";

    }
    if(chksfive)
    {
        ynfive="Y";

    }
    var Topics=$("#textarea-instopics").val();
    var Concerns=$("#textarea-insemp").val();
    var Follow=$("#textarea-insfollow").val();
    var Comments=$("#textarea-inscomments").val();
    var querys="UPDATE SUBMITTEDWPIS SET Status='C',SupQ1='"+ynone+"',SupQ2='"+yntwo+"',SupQ3='"+ynthree+"',SupQ4='"+ynfour+"',SupQ5='"+ynfive+"',Topics='"+Topics+"',Concerns='"+Concerns+"',Actions='"+Follow+"',SupDate='"+SubDate+"',SupComments='"+Comments+"',Sync='no',SyncTwo='no' WHERE SubmitID='"+SubmitIDwpi+"'";
   // alert(querys);
    tx.executeSql(querys);
    navigator.notification.confirm(
                'Saved', // mensaje (message)
                onConfirmaxxxy,      // función 'callback' a llamar con el índice del botón pulsado (confirmCallback)
                    'FieldTracker',            // titulo (title)
            'Accept'          // botones (buttonLabels)
            );
}

function opensylenceWpisx()
{
    showModal();
    var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
	db.transaction(GetopensylenceWpisx, errorCB);	
}

function GetopensylenceWpisx(tx)
{
    var querytosend="SELECT * FROM SETTINGS";
	tx.executeSql(querytosend, [], function(tx,results){ GetopensylenceWpisxSuccess(tx,results) }, errorCB);

}

function GetopensylenceWpisxSuccess(tx,results)
{
    var len = results.rows.length;
	if(len>0)
	{
		$("#ipsync").val(results.rows.item(0).IP);
		StartSyncSylenceModalWInspection();
    }


}

function StartSyncSylenceModalWInspection()
{
    var ipserver=$("#ipsync").val();
    SendAloneWpis="";
    var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryModalInsWpiSilence, errorCB);
}

function QueryModalInsWpiSilence(tx)
{
    var querytosend="SELECT * FROM SUBMITTEDWPIS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QueryModalInsWpiSilenceSuccess, errorCB);
    
}

function QueryModalInsWpiSilenceSuccess(tx,results)
{
    
    try
    {
        var len = results.rows.length;
        var array = [];
        for (var i=0; i<results.rows.length; i++){
            row = results.rows.item(i);
            array.push(JSON.stringify(row));
        }
        SendAloneWpis=array;
        sendDataToServerInspectionsWpisX();
    }
    catch(err)
    {
        hideModal();
        //alert(err);
    }

}

function sendDataToServerInspectionsWpisX()
{
    try
    {

        var ipserver=$("#ipsync").val();
        var obj = {};
        obj['WPIs'] =JSON.stringify(SendAloneWpis);  
             $.ajax({
                        type: 'POST',
                        url: ipserver+'//SetWPIs',
                        data: JSON.stringify(obj),
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8',
                        success: function (response) {
                            if(response.d=="success")
                            {

                                UpdateWpisInsModalSyncX();
                            }
                        },
                        error: function (xmlHttpRequest, textStatus, errorThrown) {
                            hideModal();    
                        console.log(xmlHttpRequest.responseXML);
                        console.log(textStatus);
                        console.log(errorThrown);
                    }
                    });

    }
    catch(error)
    {
        hideModal();
        alert(error);
    }

}

function UpdateWpisInsModalSyncX()
{
    var ipserver=$("#ipsync").val();
    var obj = {};
    var userids;
	if(!!sessionStorage.userid)
	{
		obj['UserID'] =sessionStorage.userid;
	}
	else
	{
		obj['UserID'] ="xxxxxxxx";
		
	}
    $.ajax({
        type: 'POST',
        url:ipserver+'//GetWpis',
        data: JSON.stringify(obj),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function (response) {
            InsertDatabaseWpisInsModalX(response.d);
        },
                        error: function (xmlHttpRequest, textStatus, errorThrown) {
                            hideModal();
                            console.log(xmlHttpRequest.responseXML);
                            console.log(textStatus);
                            console.log(errorThrown);
    }
    });

}

function InsertDatabaseWpisInsModalX(newdatabase)
{
    newsWpistoinsert=newdatabase;
    var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryInsertDatabaseWpisInsModalX, errorCBPA);

}

function QueryInsertDatabaseWpisInsModalX(tx)
{
	var userids;
	if(!!sessionStorage.userid)
	{
		userids =sessionStorage.userid;
	}
	else
	{
		userids ="xxxxxxxx";
		
	}
	tx.executeSql("DELETE FROM SUBMITTEDWPIS");
	var query;
	var obj;
	var itemcount=0;
	 try
	 {
		obj = jQuery.parseJSON(newsWpistoinsert.Wpis);
    	$.each(obj, function (key, value) {
	    var query="INSERT INTO SUBMITTEDWPIS (SubmitID,EmpDate,Shift,UserID,Status,SupID,WPI1,WPI2,WPI3,WPI1Status,WPI2Status,WPI3Status,HI1,HI2,HI3,CAT1,CAT2,CAT3,Sync,SyncTwo) VALUES ('"+value.SubmitID+"','"+value.EmpDate+"','"+value.Shift+"','"+value.UserID+"','"+value.Status+"','"+value.SupID+"','"+escapeDoubleQuotes(value.WPI1)+"','"+escapeDoubleQuotes(value.WPI2)+"','"+escapeDoubleQuotes(value.WPI3)+"','"+value.WPI1Status+"','"+value.WPI2Status+"','"+value.WPI3Status+"','"+escapeDoubleQuotes(value.HI1)+"','"+escapeDoubleQuotes(value.HI2)+"','"+escapeDoubleQuotes(value.HI3)+"','"+escapeDoubleQuotes(value.CAT1)+"','"+escapeDoubleQuotes(value.CAT2)+"','"+escapeDoubleQuotes(value.CAT3)+"','no','no')";
		tx.executeSql(query);
		itemcount++;
      });
	 }
	 catch(error)
	 {
		if(error=="SyntaxError: Unexpected token E")
		{
			//alert("WPIS ERROR: Web service invalid data");

		}
		else
		{
		   //alert("WPIS "+error);

		}		 
     } 
     hideModal();
        setTimeout( function(){ 
            $(':mobile-pagecontainer').pagecontainer('change', '#pageMenu', {
             transition: 'flip',
           changeHash: false,
           reverse: true,
           showLoadMsg: true
           });
       }, 1000 );    
}

function opensylenceInspections()
{
    var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
	db.transaction(GetopensylenceInspections, errorCB);	
}

function GetopensylenceInspections(tx)
{
    var querytosend="SELECT * FROM SETTINGS";
	tx.executeSql(querytosend, [], function(tx,results){ GetopensylenceInspectionsSuccess(tx,results) }, errorCB);

}

function GetopensylenceInspectionsSuccess(tx,results)
{
    var len = results.rows.length;
	if(len>0)
	{
		$("#ipsync").val(results.rows.item(0).IP);
		StartSyncModalWInspection();
	}

}

function StartSyncModalWInspection()
{
    var ipserver=$("#ipsync").val();
    SendAloneWpis="";
    var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryModalInsWpi, errorCB);
}

function QueryModalInsWpi(tx)
{
    var querytosend="SELECT * FROM SUBMITTEDWPIS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QueryModalInsWpiSuccess, errorCB);
    
}

function QueryModalInsWpiSuccess(tx,results)
{
    showUpModal();
    try
    {
        var len = results.rows.length;
        var array = [];
        for (var i=0; i<results.rows.length; i++){
            row = results.rows.item(i);
            array.push(JSON.stringify(row));
        }
        SendAloneWpis=array;
        $("#progressMessage").html("WPIs ready to send");
        pbar.setValue(10);
        sendDataToServerInspectionsWpis();
    }
    catch(err)
    {
        alert(err);
    }

}

function sendDataToServerInspectionsWpis()
{
    try
    {
        $("#progressMessage").html("Certifications ready to send");
        pbar.setValue(20);	
        var ipserver=$("#ipsync").val();
        var obj = {};
        obj['WPIs'] =JSON.stringify(SendAloneWpis);  
        $("#progressheader").html("Uploading Data...");
        $("#progressMessage").html("Preparing data to send");
        pbar.setValue(30);
             $.ajax({
                        type: 'POST',
                        url: ipserver+'//SetWPIs',
                        data: JSON.stringify(obj),
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8',
                        success: function (response) {
                            if(response.d=="success")
                            {
                                pbar.setValue(100);
                                UpdateWpisInsModalSync();
                            }
                        },
                        error: function (xmlHttpRequest, textStatus, errorThrown) {
                        $("#progressheader").html("Can not connect to server");
                                $("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
                                alert("error");
                                 setTimeout(function () { $(':mobile-pagecontainer').pagecontainer('change', '#pageMenu', {
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
    catch(error)
    {
        alert(error);
    }

}

function UpdateWpisInsModalSync()
{
    $("#progressheader").html("Connecting...");
	$("#progressMessage").html("Waiting for server connection");
    pbar.setValue(10);
    var ipserver=$("#ipsync").val();
    var obj = {};
    var userids;
	if(!!sessionStorage.userid)
	{
		obj['UserID'] =sessionStorage.userid;
	}
	else
	{
		obj['UserID'] ="xxxxxxxx";
		
	}
    $.ajax({
        type: 'POST',
        url:ipserver+'//GetWpis',
        data: JSON.stringify(obj),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function (response) {
            InsertDatabaseWpisInsModal(response.d);
        },
                        error: function (xmlHttpRequest, textStatus, errorThrown) {
                        $("#progressheader").html("Can not connect to server GetWpis");
                         $("#progressMessage").html("Error sending data:" +xmlHttpRequest.responseXML+" Status: "+textStatus+"==>"+xmlHttpRequest.statusText+" thrown: "+errorThrown);
                         setTimeout(function () { $(':mobile-pagecontainer').pagecontainer('change', '#pageInspections', {
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

function InsertDatabaseWpisInsModal(newdatabase)
{
    $("#progressheader").html("Connected");
	$("#progressMessage").html("Successful connection");
	pbar.setValue(30);
    newsWpistoinsert=newdatabase;
    var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryInsertDatabaseWpisInsModal, errorCBPA);

}

function QueryInsertDatabaseWpisInsModal(tx)
{
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
	pbar.setValue(35);
	tx.executeSql("DELETE FROM SUBMITTEDWPIS");
	$("#progressMessage").html("Ready to insert new records");
	var query;
	var obj;
	var itemcount=0;
	 try
	 {
		obj = jQuery.parseJSON(newsWpistoinsert.Wpis);
    	$.each(obj, function (key, value) {
	    var query="INSERT INTO SUBMITTEDWPIS (SubmitID,EmpDate,Shift,UserID,Status,SupID,WPI1,WPI2,WPI3,WPI1Status,WPI2Status,WPI3Status,HI1,HI2,HI3,CAT1,CAT2,CAT3,Sync,SyncTwo) VALUES ('"+value.SubmitID+"','"+value.EmpDate+"','"+value.Shift+"','"+value.UserID+"','"+value.Status+"','"+value.SupID+"','"+escapeDoubleQuotes(value.WPI1)+"','"+escapeDoubleQuotes(value.WPI2)+"','"+escapeDoubleQuotes(value.WPI3)+"','"+value.WPI1Status+"','"+value.WPI2Status+"','"+value.WPI3Status+"','"+escapeDoubleQuotes(value.HI1)+"','"+escapeDoubleQuotes(value.HI2)+"','"+escapeDoubleQuotes(value.HI3)+"','"+escapeDoubleQuotes(value.CAT1)+"','"+escapeDoubleQuotes(value.CAT2)+"','"+escapeDoubleQuotes(value.CAT3)+"','no','no')";
		tx.executeSql(query);
		itemcount++;
      });
	  $("#progressMessage").html("WPIS updated");
	  pbar.setValue(90);
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
			pbar.setValue(60);
		 
	 }
	 
     $("#Completed").html("Connected");
	 $("#progressMessage").html("Inspections updated");
		pbar.setValue(100);

        pbar.setValue(100);
        setTimeout( function(){ 
            $(':mobile-pagecontainer').pagecontainer('change', '#pageInspections', {
             transition: 'flip',
           changeHash: false,
           reverse: true,
           showLoadMsg: true
           });
       }, 3000 );    
}


function GetQuantNewInspections()
{
	//alert("principio mensajes");
	var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
	db.transaction(QuantNewInspections, errorCB);
}

function QuantNewInspections(tx)
{
	//alert("Query Mensajes");
    var UserIDx=sessionStorage.userid;
    var queryx="SELECT SUBMITTEDWPIS.SubmitID,SUBMITTEDWPIS.EmpDate, USERS.FirstName,USERS.LastName FROM SUBMITTEDWPIS INNER JOIN USERS ON SUBMITTEDWPIS.UserID=USERS.Username  WHERE SupID='"+UserIDx+"' AND Status='R' ORDER BY SUBMITTEDWPIS.EmpDate";
	tx.executeSql(queryx, [], function(tx,results){ QuantNewInspectionsSuccess(tx,results) }, errorCB);
}

function QuantNewInspectionsSuccess(tx,results)
{
	var len = results.rows.length;
	$("#UnreadI").val(len);
	//alert("Resultado Mensajes");
	//alert("messages "+len);
	if(len>0)
	{
		$("#mbtninspection").html('<img src="img/Inspections.png" height="36" width="36"/><br>WP Inspections('+len+')');
	}
	else
	{
		$("#mbtninspection").html('<img src="img/Inspections.png" height="36" width="36"/><br>WP Inspections');
	}
	//alert("Final mensajese3");
}

function FillReadWorkPlaceR()
{
    //alert("0");
    var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
	db.transaction(FillReadWorkPlaceRQuery, errorCB);
}

function FillReadWorkPlaceRQuery(tx)
{
    //GET ID
    //alert("1");
    var idInsTT= $("#mlpid").val();
    var queryx="SELECT * FROM SUBMITTEDWPIS WHERE SubmitID='"+idInsTT+"'";
    //alert(queryx);
    tx.executeSql(queryx, [], ReadSuccessWorkplace,errorCBPA);
    //alert(idInsTT);

}

function ReadSuccessWorkplace(tx,results)
{
    //alert("2");
    var len = results.rows.length;
    //alert(len);
    if(len>0)
    {
        var EmpdateRead=results.rows.item(0).EmpDate;
        var ShiftRead=results.rows.item(0).Shift;
        var StatusRead=results.rows.item(0).Status;
        var WpI1Read=results.rows.item(0).WPI1;
        var WpI2Read=results.rows.item(0).WPI2;
        var WPI3Read=results.rows.item(0).WPI3;
        var WPI1SRead=results.rows.item(0).WPI1Status;
        var WPI2SRead=results.rows.item(0).WPI2Status;
        var WPI3SRead=results.rows.item(0).WPI3Status;
        var HI1Read=results.rows.item(0).HI1;
        var HI2Read=results.rows.item(0).HI2;
        var HI3Read=results.rows.item(0).HI3;
        var CAT1Read=results.rows.item(0).CAT1;
        var CAT2Read=results.rows.item(0).CAT2;
        var CAT3Read=results.rows.item(0).CAT3;
        var ShiftRead=results.rows.item(0).Shift;
        $("#workplaceoner").val(WpI1Read);
        $("#workplacetwor").val(WpI2Read);
        $("#workplacethreer").val(WPI3Read);
	    $("#workplacefourr").val(HI1Read);
        $("#workplacefiver").val(HI2Read);
        $("#workplacesixr").val(HI3Read);
        $("#workplacesevenr").val(CAT1Read);
        $("#workplaceeightr").val(CAT2Read);
        $("#workplaceniner").val(CAT3Read);
        if(WPI1SRead=="R")
        {
            $("#btnRoner").removeClass("buttongreens");
           // $("#btnSoner").removeClass("buttonreds");
            $("#btnRoner").removeClass("buttonInspection");
            $("#btnRoner").addClass("buttonreds");
            $("#btnSoner").removeClass("buttonreds");
            $("#btnSoner").removeClass("buttongreens");
            $("#btnSoner").addClass("buttonInspection");
        }
        else
        {
           
            $("#btnSoner").removeClass("buttonreds");
            $("#btnSoner").removeClass("buttonInspection");
            $("#btnSoner").addClass("buttongreens");
            $("#btnRoner").removeClass("buttonreds");
            $("#btnRoner").removeClass("buttongreens");
            $("#btnRoner").addClass("buttonInspection");

        }
        if(WPI2SRead=="R")
        {
           // $("#btnStwor").removeClass("buttongreens");
            $("#btnRtwor").removeClass("buttongreens");
            // $("#btnSoner").removeClass("buttonreds");
             $("#btnRtwor").removeClass("buttonInspection");
             $("#btnRtwor").addClass("buttonreds");
             $("#btnStwor").removeClass("buttonreds");
             $("#btnStwor").removeClass("buttongreens");
             $("#btnStwor").addClass("buttonInspection");

        }
        else
        {
            $("#btnStwor").removeClass("buttonreds");
            $("#btnStwor").removeClass("buttonInspection");
            $("#btnStwor").addClass("buttongreens");
            $("#btnRtwor").removeClass("buttonreds");
            $("#btnRtwor").removeClass("buttongreens");
            $("#btnRtwor").addClass("buttonInspection");

        }
        if(WPI3SRead=="R")
        {
            // $("#btnStwor").removeClass("buttongreens");
            $("#btnRthreer").removeClass("buttongreens");
            // $("#btnSoner").removeClass("buttonreds");
             $("#btnRthreer").removeClass("buttonInspection");
             $("#btnRthreer").addClass("buttonreds");
             $("#btnSthreer").removeClass("buttonreds");
             $("#btnSthreer").removeClass("buttongreens");
             $("#btnSthreer").addClass("buttonInspection");

        }
        else
        {
            $("#btnSthreer").removeClass("buttonreds");
            $("#btnSthreer").removeClass("buttonInspection");
            $("#btnSthreer").addClass("buttongreens");
            $("#btnRthreer").removeClass("buttonreds");
            $("#btnRthreer").removeClass("buttongreens");
            $("#btnRthreer").addClass("buttonInspection");

        }

        //alert(ShiftRead);
        $("#shiftworkpr").val(ShiftRead);
        $('#shiftworkpr').selectmenu('refresh');
        $('#shiftworkpr').selectmenu('refresh', true);

        //alert(EmpdateRead);
    }

}

function openNoModalsylenceInspections()
{
    //alert("comienza");
    var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
	db.transaction(GetNMsylenceInspections, errorCB);	
}

function GetNMsylenceInspections(tx)
{
    var querytosend="SELECT * FROM SETTINGS";
	tx.executeSql(querytosend, [], function(tx,results){ GetNMsylenceInspectionsSuccess(tx,results) }, errorCB);

}

function GetNMsylenceInspectionsSuccess(tx,results)
{
    var len = results.rows.length;
	if(len>0)
	{
		$("#ipsync").val(results.rows.item(0).IP);
		StartSyncNMWInspection();
	}

}

function StartSyncNMWInspection()
{
    var ipserver=$("#ipsync").val();
    SendAloneWpis="";
    var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryNMInsWpi, errorCB);
}

function QueryNMInsWpi(tx)
{
    var querytosend="SELECT * FROM SUBMITTEDWPIS WHERE Sync='no'";
	tx.executeSql(querytosend, [], QueryNMInsWpiSuccess, errorCB);
    
}

function QueryNMInsWpiSuccess(tx,results)
{
   
    try
    {
        var len = results.rows.length;
        var array = [];
        for (var i=0; i<results.rows.length; i++){
            row = results.rows.item(i);
            array.push(JSON.stringify(row));
        }
        SendAloneWpis=array;
        sendDataToServerNMInspectionsWpis();
    }
    catch(err)
    {
        alert(err);
    }

}

function sendDataToServerNMInspectionsWpis()
{
    try
    {
        var ipserver=$("#ipsync").val();
        var obj = {};
        obj['WPIs'] =JSON.stringify(SendAloneWpis);  
             $.ajax({
                        type: 'POST',
                        url: ipserver+'//SetWPIs',
                        data: JSON.stringify(obj),
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8',
                        success: function (response) {
                            if(response.d=="success")
                            {
                                pbar.setValue(100);
                                UpdateWpisNMInsModalSync();
                            }
                        },
                        error: function (xmlHttpRequest, textStatus, errorThrown) {
                        console.log(xmlHttpRequest.responseXML);
                        console.log(textStatus);
                        console.log(errorThrown);
                    }
                    });

    }
    catch(error)
    {
        alert(error);
    }

}

function UpdateWpisNMInsModalSync()
{
    var ipserver=$("#ipsync").val();
    var obj = {};
    var userids;
	if(!!sessionStorage.userid)
	{
		obj['UserID'] =sessionStorage.userid;
	}
	else
	{
		obj['UserID'] ="xxxxxxxx";
		
	}
    $.ajax({
        type: 'POST',
        url:ipserver+'//GetWpis',
        data: JSON.stringify(obj),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: function (response) {
            InsertDatabaseWpisInsNM(response.d);
        },
                        error: function (xmlHttpRequest, textStatus, errorThrown) {
                            console.log(xmlHttpRequest.responseXML);
                            console.log(textStatus);
                            console.log(errorThrown);
    }
    });

}

function InsertDatabaseWpisInsNM(newdatabase)
{
	
    newsWpistoinsert=newdatabase;
    var db = window.openDatabase("Fieldtracker", "1.0", "Fieldtracker", 50000000);
    db.transaction(QueryInsertDatabaseWpisNM, errorCBPA);

}

function QueryInsertDatabaseWpisNM(tx)
{
	var userids;
	if(!!sessionStorage.userid)
	{
		userids =sessionStorage.userid;
	}
	else
	{
		userids ="xxxxxxxx";
		
	}
	tx.executeSql("DELETE FROM SUBMITTEDWPIS");
	var query;
	var obj;
	var itemcount=0;
	 try
	 {
		obj = jQuery.parseJSON(newsWpistoinsert.Wpis);
    	$.each(obj, function (key, value) {
	    var query="INSERT INTO SUBMITTEDWPIS (SubmitID,EmpDate,Shift,UserID,Status,SupID,WPI1,WPI2,WPI3,WPI1Status,WPI2Status,WPI3Status,HI1,HI2,HI3,CAT1,CAT2,CAT3,Sync,SyncTwo) VALUES ('"+value.SubmitID+"','"+value.EmpDate+"','"+value.Shift+"','"+value.UserID+"','"+value.Status+"','"+value.SupID+"','"+escapeDoubleQuotes(value.WPI1)+"','"+escapeDoubleQuotes(value.WPI2)+"','"+escapeDoubleQuotes(value.WPI3)+"','"+value.WPI1Status+"','"+value.WPI2Status+"','"+value.WPI3Status+"','"+escapeDoubleQuotes(value.HI1)+"','"+escapeDoubleQuotes(value.HI2)+"','"+escapeDoubleQuotes(value.HI3)+"','"+escapeDoubleQuotes(value.CAT1)+"','"+escapeDoubleQuotes(value.CAT2)+"','"+escapeDoubleQuotes(value.CAT3)+"','no','no')";
		tx.executeSql(query);
		itemcount++;
      });
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
		 
     } 
     //alert("finish sinc");
     GetQuantNewInspections();
}



  
