var ALERT = {
	"DL_NODATA" : "No data yet.",
	"MIC" : "Please Turn <b>ON</b><br>Microphone AND Volume",
};

var QUIET_PATH = "/quiet-js/lib/quiet-js/";

var QUIET_CONFIG = {
	profilesPrefix: QUIET_PATH,
	memoryInitializerPrefix: QUIET_PATH,
	libfecPrefix: QUIET_PATH
}

$(function(){

	$(document).on("click",".quiet_start_button",function(){
		onStartEncodeHandle();
	});

})

$(function(){
	sendInit();


})


function getByte(text){
	return encodeURI(text).replace(/%[0-9A-F]{2}/g, '*').length
}

function onStartEncodeHandle(){

	var content = $(".send_tt").val();
	var congfig = { 
		size : getByte(content),
		md5  : MD5_hexhash(content),
		time : parseInt(new Date().getTime()/1000)
	};

	var json = JSON.stringify(congfig);

	$(".send_tt_real").val(json + "\n" + content + "\n" + "0000");
	$(".quiet_start_button_real").trigger("click")


	$("body").trigger("RESET_RECV");
	$(".download").prop("disabled","true");

	$(".quiet_start_button").prop("disabled",true)

	$(".clearButton").trigger("click");

}

$(function(){

	$("body").bind("notice",function(e,n){
		$(".debug").html(n);
	})


	$(".menu").click(function(e){

		$(".menu-selected").removeClass("menu-selected");
		$(this).addClass("menu-selected");
		e.preventDefault();

		var val = $(this).attr("value");

		$(".box").hide();

		if(val.match(/^recv|send$/)){
			$(".box-"+val).show();
		} else {
		$(".box").show();
		}

	});
})

$(function(){
	$(".clearButton").click(function(){
		$(".recv_tt").val("");
		$("recvbyte,.preview_recv").html("");
		$("body").trigger("RESET_RECV");
		$(".download").prop("disabled","true");

		IS_FINISH = 0;

	});
})

function show_MICAlert(){
	var fg = $("<div style='position:fixed;top:0px;left:0px;background:rgba(0,0,0,.3);width:100%;height:100%;text-align:center'></div>");
	$("body").append(fg);
	
	fg.append("<div style='box-shadow: 0 10px 25px 0 rgba(0, 0, 0, .5);margin-top:100px;display:inline-block;padding:10px;background:white;min-width:200px'>" + 
	'<div><span class="fas fa-microphone" style="font-size:30pt"></span>&nbsp;&nbsp;<span style="font-size:30pt" class="fas fa-volume-up" ></span></div>' + 

	"<div style='padding:10px'>" + ALERT["MIC"] + "</div>" + 
	"<div><input autofocus style='margin:10px' type=button class=recv_button value='OK'></div></div>");

	$(document).on("click",".recv_button",function(){
		$(fg).remove();
		recvInit();
		$("body").trigger("dtmf_init");
	})


}

var IS_FINISH = 0;

$(function(){

	$("body").bind("receive",function(e,val){

		

		if(!$(".recv_tt").is(":visible")){
			return;
		}

		var lines = val.split("\n");
		var header = lines.shift();
		var footer = lines.pop();
		var body = lines.join("\n");

		console.log({
			header : header,
			body : body,
			footer : footer
		});

		var json = JSON.parse(header);
		var CHECK;

		$(".recv_tt").val(body).trigger("input");

		var per = json.size && body ? parseInt(getByte(body)/json.size*100) : 0;
		if(per > 100){
			per = 0;
		}

/*
		var time = parseInt(new Date().getTime()/1000);
		var left;
		console.log(json);

		var keika = time - ParseInt(json.time);
		var left;

		if(keika){
			left = z(keika/60) + ":" + z(keika%60);
		}
*/

		var graph = "<div class='top_graph bar_graph graph_wrap'>" + 
								"<div class='inner_graph a' style='width:"+per+"%;'>&nbsp;</div>" + 
								"<div class='inner_graph d' style='width:"+(100-per)+"'>&nbsp;</div>" + 
								"</div>";

		$("recvbyte").html( 
			"<b>" + body.length + "</b>文字 " + 
			"<b>" + body.split("\n").length + "</b>行 " + 
//		"<b>" + keika + "</b> " + 
			"<b>" + getByte(body) +"</b>/"+ "<b>" + json.size + "</b>" + " byte " + 
			graph + 
			"<b>" + per + "</b>%"
		);

		setScrollMax($(".preview_recv"));
		setScrollMax($(".recv_tt"));

		if(footer == "0000"){

			IS_FINISH = 1;

			if(
				json && 
				MD5_hexhash(body) == json.md5 &&
				json.size == getByte(body)
			){
				$("body").trigger("RECIEVE_COMPLETE");
			} else {

				$("body").trigger("RECIEVE_FAIL");
			}
		}


	});

	$(".recv_tt").on("input",function(){

		$(".preview_recv").html( makeTable($(".recv_tt").val()) );

	});

	$("body").bind("RECIEVE_COMPLETE",function(){
		new Audio("ok.mp3").play();
		$("recvbyte").append("<font color=green><b>OK!</b></font>");
		$(".download").prop("disabled","").trigger("click");

	});

	$("body").bind("RECIEVE_FAIL",function(){
		new Audio("ng.mp3").play();
		$("recvbyte").append("<font color=red><b>ERROR!</b></font>");
		$(".download").prop("disabled","true");
	});

})



function sendInit(){

	return (function() {
    Quiet.init(QUIET_CONFIG);
    var btn;
    var textbox;
    var warningbox;
    var transmit;

    function onTransmitFinish() {
        textbox.focus();
        btn.addEventListener('click', onClick, false);
        btn.disabled = false;
        var originalText = btn.innerText;
        btn.innerText = btn.getAttribute('data-quiet-sending-text');
        btn.setAttribute('data-quiet-sending-text', originalText);
        
				$(".quiet_start_button").prop("disabled","");

        if($(".loop").is(":checked")){
	        setTimeout(function(){
	        	btn.click();
	        },500);
	      }
        
    };

    function onClick(e) {
        e.target.removeEventListener(e.type, arguments.callee);
        e.target.disabled = true;
        var originalText = e.target.innerText;
        e.target.innerText = e.target.getAttribute('data-quiet-sending-text');
        e.target.setAttribute('data-quiet-sending-text', originalText);
        var payload = textbox.value;
        if (payload === "") {
            onTransmitFinish();
            return;
        }
        transmit.transmit(Quiet.str2ab(payload));
    };

    function onQuietReady() {
        var profilename = document.querySelector('[data-quiet-profile-name]').getAttribute('data-quiet-profile-name');
        transmit = Quiet.transmitter({profile: profilename, onFinish: onTransmitFinish});
        btn.addEventListener('click', onClick, false);
    };

    function onQuietFail(reason) {
        console.log("quiet failed to initialize: " + reason);
        warningbox.classList.remove("hidden");
        warningbox.textContent = "Sorry, it looks like there was a problem with this example (" + reason + ")";
    };

    function onDOMLoad() {
        btn = document.querySelector('[data-quiet-send-button]');
        textbox = document.querySelector('[data-quiet-text-input]');
        warningbox = document.querySelector('[data-quiet-warning]');
        Quiet.addReadyCallback(onQuietReady, onQuietFail);
    };

    onDOMLoad();
})();


	}

function setScrollMax(obj){
	$(obj).scrollTop($(obj).get(0).scrollHeight);
}

function makeTable(html){
	var trs = [];

	$(html.split("\n")).each(function(i,e){
		var tds = [];

		var is_blank = 1;
		$(e.split(/\t|,/)).each(function(i,e){
			if(e){
				is_blank = 0;
			}
			tds.push("<td>"+e+"</td>");
		});

		if(!is_blank){
			trs.push("<tr>"+tds.join("")+"</tr>");
		}
	})

	var table = "<table width=100% border=1 cellpadding=5 cellspacing=0>" + 
		trs.join("\n") + 
		"</table>";

	return table;

}

$(function(){

	$(".send_tt").change(function(){

		var val = $(this).val();
		    val = val.replace(/(\r\n|\r|\n)/g,"\n");

		var trs = [];
		$(val.split("\n")).each(function(i,e){
			var tds = [];
			var is_blank = 1;
			$(e.split(/\t|,/)).each(function(i,_e){
				if(_e){
					is_blank = 0;
				}
				tds.push(_e);
			});
			if(!is_blank){
				trs.push(tds.join("\t"));
			}
		})
		var table = trs.join("\n");
		$(".send_tt").val(table);

	})

	$(".send_tt").bind("change input",function(){
		 $("sendbyte").html( 
				"<font size=2><b>" + new String($(".send_tt").val()).length + "</b> 文字 " +
				"<b>" + new String($(".send_tt").val()).split("\n").length + "</b> 行 " +
				"<font size=1>(" + getByte(new String($(".send_tt").val())) + " byte)" + 
				"</fonts>"
			)

		if($(this).val()){
			$(".sendBt").prop("disabled","");
		} else {
			$(".sendBt").prop("disabled","false");
		}

		$(".preview_send").html( makeTable($(".send_tt").val()) );

	});

	$('.drop_area').on('dragenter dragover', function (e) {
		 $('.drop_area').addClass("dropOver");
			e.stopPropagation();
			e.preventDefault();
	});

	$('.drop_area').on('dragleave', function (event) {
	  event.stopPropagation();
	  event.preventDefault();
		$('.drop_area').removeClass("dropOver");
});





$('.drop_area').on('drop', function (event) {
	event.preventDefault();
	$('.drop_area').removeClass("dropOver");
  $('.file')[0].files = event.originalEvent.dataTransfer.files;

	if ($('.file')[0].files.length > 1) {
		alert('複数ファイルは対応してぬい。。');
		return;
	}

	$('.file').trigger("change");

});


	$(".file").change(function(e){
		handleFile(e.target.files[0]);
	})

})

	function handleFile(file){
		
		var fileReader = new FileReader();
		 fileReader.onload = function() {
		 $(".send_tt").val(file.name +"\n"+ this.result).trigger("change");
		}
		fileReader.readAsDataURL(file);
	
	}


	$(".fileSelect").click(function(){
		$(".file").click();
	});


$(function(){
	$(".download").click(function(){
		
		var recvText = $(".recv_tt").val();
		
		if(recvText == ""){
			alert(ALERT["DL_NODATA"]);
			return;
		}
		
		var is_file = recvText.match(/^(.*)\ndata:/);
		var blob;
		var filename;

		if(is_file){

			var vals = new String($(".recv_tt").val()).split("\n");
			filename = vals[0];

			var dataURI = vals[1];
			
			var byteString = atob( dataURI.split( "," )[1] ) ;
			var mimeType = dataURI.match( /(:)([a-z\/]+)(;)/ )[2] ;

			for( var i=0, l=byteString.length, content=new Uint8Array( l ); l>i; i++ ) {
				content[i] = byteString.charCodeAt( i ) ;
			}

			blob = new Blob( [ content ], {
					type: mimeType ,
			} ) ;

		} else {

			var BOM = "\ufeff";
			recvText = recvText.replace(/\t/g,",");

			blob = new Blob( [ BOM + recvText ], {
					type: "text/plain" ,
			} ) ;

			filename = "list" + getYYMMDD() + "_" + getHHMMSS() +".csv";
		}

		 var a = document.createElement("a");
		  a.href = URL.createObjectURL(blob);
		  a.target = '_blank';
		  a.download = filename;
		  a.click();

	
	})
})

function getHHMMSS(){
	var d = new Date();
	var h = d.getHours();
	var m = d.getMinutes();
	var s = d.getSeconds();
	return [z(h),z(m),z(s)].join("");
}

function getYYMMDD(){
	var d = new Date();
	var y = d.getYear() - 100;
	var m = d.getMonth() + 1;
	var d = d.getDate();
	return [y,z(m),z(d)].join("");
}

function z(n){
	return n<10 ? "0"+n : n;
}

function recvInit(){

var recv = (function() {
    Quiet.init(QUIET_CONFIG);
    var target;
    var content = new ArrayBuffer(0);
    var warningbox;

    function onReceive(recvPayload) {
				console.log(recvPayload);

			if(IS_FINISH){
				$(".clearButton").trigger("click");
			}


        content = Quiet.mergeab(content, recvPayload);


        //target.textContent = Quiet.ab2str(content);
				console.log(Quiet.ab2str(content));
				$("body").trigger("receive",Quiet.ab2str(content));
        warningbox.classList.add("hidden");
    };

    function onReceiverCreateFail(reason) {
        console.log("failed to create quiet receiver: " + reason);
        warningbox.classList.remove("hidden");
        warningbox.textContent = "use mic . use chrome."
    };

    function onReceiveFail(num_fails) {
			if($(".recv_tt").is(":visible")){
        warningbox.classList.remove("hidden");
        warningbox.textContent = "Error:Volume up plz."
			}
    };


		$("body").bind("RESET_RECV",function(){
			content = new ArrayBuffer(0);
		});


    function onQuietReady() {
        var profilename = document.querySelector('[data-quiet-profile-name]').getAttribute('data-quiet-profile-name');
        Quiet.receiver({profile: profilename,
             onReceive: onReceive,
             onCreateFail: onReceiverCreateFail,
             onReceiveFail: onReceiveFail
        });
    };

    function onQuietFail(reason) {
        console.log("quiet failed to initialize: " + reason);
        warningbox.classList.remove("hidden");
        warningbox.textContent = "something wrong.. (" + reason + ")";
    };

    function onDOMLoad() {
        target = document.querySelector('[data-quiet-receive-text-target]');
        warningbox = document.querySelector('[data-quiet-warning]');
        Quiet.addReadyCallback(onQuietReady, onQuietFail);
    };

		onDOMLoad();

		return Quiet;

})();
	}