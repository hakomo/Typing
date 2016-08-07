
MusicList=function(id,xmlpath,musicpath,name){
  this.id=id;
  this.xmlpath=xmlpath;
  this.musicpath=musicpath;
  this.name=name;
}

Music=function(japan,kana,interval){
  this.japan=japan;
  this.kana=kana;
  this.interval=interval;
}

function up(){
  $("#musiclist li:last").remove();
  $("<li>").prependTo("#musiclist").text(
    selected-center>0?musiclist[selected-center-1].name:"");
  selected--;
  $("#musiclist .selected").removeClass("selected").
    prev().addClass("selected");
}
function down(){
  $("#musiclist li:first").remove();
  $("<li>").appendTo("#musiclist").text(
    selected+height-center<musiclist.length?
      musiclist[selected+height-center].name:"");
  selected++;
  $("#musiclist .selected").removeClass("selected").
    next().addClass("selected");
}

function selectEvent(e){
  if(false){
  }else if(e.which==38){
    if(selected==0){
      for(i=0;i<musiclist.length-1;++i)
        down();
    }else{
      up();
    }
  }else if(e.which==40){
    if(selected==musiclist.length-1){
      for(i=0;i<musiclist.length-1;++i)
        up();
    }else{
      down();
    }
  }else if(e.which==32){
    $("body").unbind("keydown",selectEvent);
    startInit();
  }
}

function startEvent(e){
  if(false){
  }else if(e.which==27){
    $("body").unbind("keydown",startEvent);
    selectInit();
  }else if(e.which==32){
    $("body").unbind("keydown",startEvent);
    audio.play();
  }
}

function progressp(){
  if(index!=music[progress].kana.length){
    combo=0;
    $("#combo").text("");
    ttime+=music[progress+1].interval-music[progress].interval;
  }

  $("#typespeed div:last").text(parseInt(type*60000/ttime)+" / MIN");

  ++progress;
  progressq();
}
function progressq(){
  index=0;
  indexp();

  $("#japan").text(music[progress].japan);

  if(progress+1!=music.length){
    $("#interval div").width(0);
    $("#interval div").animate({width:"600px"},music[progress+1].interval-
                               music[progress].interval,"linear",progressp);
  }
}

function playInit(){
  time=new Date();

  progress=combo=miss=type=ttime=0;
  progressq();

  $("#totaltime div").animate({
    width:"600px"},music[music.length-1].interval,"linear");

  $("body").keydown(playEvent);
}

function indexp(){
  kana=music[progress].kana;
  if(false){
  }else if(index==kana.length){
    ttime+=new Date()-time-music[progress].interval;
  }else if(kana.charCodeAt(index)<256){
    candidate=[kana.charCodeAt(index)];
  }else if(kana[index]=="っ"){
    candidate=roma[kana[index]];
    if(index+1!=kana.length&&kana.charCodeAt(index+1)>255){
      roma_=roma[kana[index+1]];
      for(i=0;i<roma_.length;++i){
        if([97,101,105,110,111,117].indexOf(roma_[i][1])==-1&&
           candidate.indexOf([1,roma_[i][1],roma_[i][1]])==-1)
          candidate.push([1,roma_[i][1],roma_[i][1]]);
      }
    }
  }else{
    candidate=roma[kana[index]];
    if(index+1!=kana.length&&roma[kana.slice(index,index+2)])
      candidate=candidate.concat(roma[kana.slice(index,index+2)]);
  }
  position=1;

  if(index==kana.length){
    $("#kana span:first").text("").next().text("");
    $("#japan").text("");
  }else{
    $("#kana span:first").text(kana.slice(0,index)).
      next().text(kana.slice(index));
  }
}

function playEvent(e){
  if(e.which==27){
    clearInterval(timer);
    $("body").unbind("keydown",playEvent);
    selectInit();
    return;
  }

  if(index==music[progress].kana.length)
    return;

  candidate_=new Array();
  p=-1;
  for(i=0;i<candidate.length;++i){
    if(candidate[i][position]!=e.which)
      continue;
    if(position+1==candidate[i].length)
      p=candidate_.length;
    candidate_.push(candidate[i]);
  }
  ++combo;
  if(false){
  }else if(candidate_.length==0){
    combo=0;
    ++miss;
    $("#combo").text("");
    $("#miss div:last").text(miss);
  }else if(p==-1){
    candidate=candidate_;
    ++position;
  }else if(candidate_.length>1){
    console.log("huku");
    candidate_.splice(p,1);
    for(i=0;i<candidate_.length;++i)
      candidate_[i]=candidate_[i].slice(position+1);
    ++index;
    indexp();
    //console.log(candidate_);
    k=candidate.length;
    for(i=0;i<candidate_.length;++i){
      for(j=0;j<k;++j){
        candidate.push(candidate_[i].concat(candidate[j].slice(1)));
        candidate[candidate.length-1].unshift(candidate[j][0]);
      }
    }
    //console.log(candidate);
  }else if(candidate_[0][candidate_[0].length-2]==
           candidate_[0][candidate_[0].length-1]){
    //console.log("ltu");
    ++index;
    indexp();
    for(i=0;i<candidate.length;){
      if(candidate[i][1]==candidate_[0][candidate_[0].length-1])
        ++i;
      else
        candidate.splice(i,1);
    }
    position=2;
  }else{
    //console.log("hutu");
    index+=candidate[0][0];
    indexp();
  }
  if(combo!=0){
    ++type;
    $("#combo").text(combo+" COMBO");
    $("#correct div:last").text(type);
  }
  //console.log(music[progress].kana[index]);
  //console.log(candidate);
}

function startInit(){
  $("#screen").empty();

  audio=new Audio(musiclist[selected].musicpath);
  $(audio).bind("playing",playInit);

  $.ajax({
    type:"get",
    dataType:"xml",
    url:musiclist[selected].xmlpath,
    success:function(xml){

      japan=new Array();
      $(xml).find("nihongoword").each(function(){
        japan.push($(this).text()=="@"?"":$(this).text());
      });

      kana=new Array();
      $(xml).find("word").each(function(){
        kana.push($(this).text()=="@"?"":$(this).text());
      });

      interval=[0];
      $(xml).find("interval").each(function(){
        interval.push(interval[interval.length-1]+parseInt($(this).text()));
      });

      music=new Array();
      for(i=0;i<japan.length;++i)
        music.push(new Music(japan[i],kana[i],interval[i]));

      $("<div>").appendTo("#screen").attr("id","combo");
      $("<div>").appendTo("#screen").attr("id","totaltime").
        append("<div>");
      $("<div>").appendTo("#screen").attr("id","interval").
        append("<div>");
      $("<div>").appendTo("#screen").attr("id","kana").
        append("<span>").append("<span>");
      $("<div>").appendTo("#screen").attr("id","japan");
      $("<div>").appendTo("#screen").attr("id","typespeed").
        append("<div>").append("<div>");
      $("#typespeed div:first").text("TYPESPEED").
        next().text("/ MIN");
      $("<div>").appendTo("#screen").attr("id","miss").
        append("<div>").append("<div>");
      $("#miss div:first").text("MISS").
        next().text("0");
      $("<div>").appendTo("#screen").attr("id","correct").
        append("<div>").append("<div>");
      $("#correct div:first").text("CORRECT").
        next().text("0");

      $("body").keydown(startEvent);
    }
  });
}

function selectInit(){
  $("#screen").empty();
  $("<ol>").appendTo("#screen").attr("id","musiclist");

  for(i=0;i<height;++i)
    $("<li>").appendTo("#musiclist");

  $("#musiclist li:eq("+center+")").addClass("selected");

  i=Math.max(0,center-selected);
  j=Math.max(0,selected-center);
  while(i<height&&j<musiclist.length){
    $("#musiclist li:eq("+i+")").text(musiclist[j].name);
    ++i;
    ++j;
  }

  $("body").keydown(selectEvent);
}

function init(){
  $.ajax({
    type:"get",
    dataType:"xml",
    url:"musiclist.xml",
    success:function(xml){

      musiclist=new Array();
      $(xml).find("musicinfo").each(function(){
        musiclist.push(new MusicList(
          parseInt($(this).attr("id")),
          $(this).attr("xmlpath"),
          $(this).attr("musicpath"),
          $(this).find("musicname").text()));
      });
      musiclist.sort(function(p,q){ return p.id-q.id; });

      height=parseInt(($("#screen").height()+59)/60);
      center=parseInt((height-1)/2);
      selected=0;

      $.getJSON("romaji.json",function(json){
        roma=new Object();
        for(k in json){
          roma[k]=new Array(json[k].length);
          for(i=0;i<json[k].length;++i){
            roma[k][i]=[k.length];
            for(j=0;j<json[k][i].length;++j)
              roma[k][i].push(json[k][i].charCodeAt(j)-32);
          }
        }

        selectInit();
      });
    }
  });
}

$(function(){
  init();
});
