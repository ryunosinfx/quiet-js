var DEFAULT = {};

function set_jp(){

	$(["ぜんぶ","送信のみ","受信のみ"]).each(function(i,e){
		$(".menu:eq("+i+")").text(e);
	})

	$(["送信","受信","ダウンロード"]).each(function(i,e){
		$("h2:eq("+i+")").text( (i+1) + ":"+ e);
	})

	$(["テキストを入力、ファイル選択、ドラッグ＆ドロップ",
		"マイクで受信したデータ(Read Only)"]).each(function(i,e){
		$("textarea:eq("+i+")").attr( "placeholder", e);
	})

	$(".sendBt").text("エンコード開始");
	$(".box-recv > .sub").text("※マイクが受信すると、ここに文字が入る");
	$(".box-dl > .sub").text("※受信が終わったらクリックでファイル変換");

	ALERT = {
		"DL_NODATA" : "まだ何も受信しとらん",
		"MIC"       : "音量＆マイクをONにしてね。",
	};
}


function get_default(){
	$(".menu").each(function(i,e){
		DEFAULT["menu:"+i] = $(this).text();
	})
	$("h2").each(function(i,e){
		DEFAULT["h2:"+i] = $(this).text();
	})
	$("textarea").each(function(i,e){
		DEFAULT["tt:"+i] = $(this).attr("placeholder");
	})
	DEFAULT["sendBt"] = $(".sendBt").text();
	DEFAULT["recv_sub"] = $(".box-recv > .sub").text();
	DEFAULT["dl_sub"] = $(".box-dl > .sub").text();
}

function set_en(){

	$(".menu").each(function(i,e){
		$(this).text(DEFAULT["menu:"+i]);
	})

	$("h2").each(function(i,e){
		$(this).text(DEFAULT["h2:"+i]);
	})

	$("textarea").each(function(i,e){
		$(this).attr("placeholder",DEFAULT["tt:"+i]);
	})

	$(".sendBt").text(DEFAULT["sendBt"]);
	$(".box-recv > .sub").text(DEFAULT["recv_sub"]);
	$(".box-dl > .sub").text(DEFAULT["dl_sub"]);


}

$(function(){

	get_default();

	$(".lang").click(function(){
		$(".lang-selected").removeClass("lang-selected");
		$(this).addClass("lang-selected");
	})

	$(".lang-en").click(function(e){
		localStorage.removeItem('lang');
		set_en();
	});

	$(".lang-ja").click(function(e){
		localStorage.setItem('lang', 'jp');
		set_jp();
		e.preventDefault();
	})

	if(localStorage.getItem("lang") == "jp" || location.hash == "#jp"){
		$(".lang-ja").trigger("click");
		location.hash = "";
	}
});