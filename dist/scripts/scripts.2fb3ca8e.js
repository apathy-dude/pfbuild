"use strict";angular.module("dprCalcApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch","ui.bootstrap"]).constant("_",window._).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/license/",{templateUrl:"views/openGameLicense.html"}).when("/class-list/",{templateUrl:"views/class-list.html",controller:"ClassListCtrl"}).otherwise({redirectTo:"/"})}]);var app=angular.module("dprCalcApp");app.filter("orderObjectBy",function(){return function(a,b,c){return _.chain(_.keys(a)).map(function(b){var c=a[b];return c._objectKey=b,c}).sortBy(function(a){return c?-a[b]:a[b]}).value()}}),app.service("pointBuyService",function(){var a={3:-4,4:-4,5:-4,6:-4,7:-4,8:-2,9:-1,10:0,11:1,12:2,13:3,14:5,15:7,16:10,17:13,18:17};return function(b){return _.reduce(b,function(b,c){return c=c>18?18:c,c=7>c?7:c,b+a[c]},0)}}),app.service("editService",function(){var a={id:null,value:null,target:null,source:null,dependentSources:null,dependentTargets:null,dependentValues:[]};return a.set=function(b,c,d,e,f){if(a.clear(),a.id=b,a.source=c,a.target=d,a.value=c[d],a.dependentSources=e,a.dependentTargets=f,a.dependentValue=[],e&&f)for(var g=0;g<e.length&&g<f.length;g++){var h=e[g],i=f[g];a.dependentValues[g]=h[i]}},a.clear=function(){if(a.id=null,a.dependentSources&&a.value===a.target[a.source])for(var b=0;b<a.dependentSources.length&&b<a.dependentTargets.length&&b<a.dependentValues.length;b++){var c=a.dependentSources[b],d=a.dependentTargets[b];c[d]=a.dependentValues[b]}},a.cancel=function(){a.source[a.tartet]=a.value,a.clear()},a}),app.service("abilityModService",function(){return function(a){return a=parseInt(a),Math.floor((a-10)/2)}}),app.service("abilityScoreService",function(){return["strength","dexterity","constitution","intelligence","wisdom","charisma"]}),app.service("statService",["bonusService","abilityModService",function(a,b){function c(c,d,e){var g;switch("string"==typeof e.type&&(e.type=parseInt(e.type)),e.type){case a.STATIC:g=e.value;break;case a.DYNAMIC:g=e.value;break;case a.ABILITY:var h=f(c,d,e.value);g=b(h);break;case a.STAT:g=f(c,d,e.value);break;case a.BASE_ABILITY:g=c.data.abilityScores[e.value];break;case a.DICE:var i=e.value.split("d");g=(parseInt(i[1])/2+.5)*parseInt(i[0]);break;case a.POWER_ATTACK_HIT:var j=f(c,d,"bab");g=-1*(Math.floor(j/4)+1);break;case a.POWER_ATTACK_DMG:var k=f(c,d,"bab");k=Math.floor(k/4)||1,g=e.value?3*k:2*k;break;case a.TWO_WEAPON:g=-2}if("string"==typeof g&&(g=parseFloat(g),g=isNaN(g)?0:g),e.modifier){var l=e.modifier;"string"==typeof l&&(l=d[l]||d.data[l]),g*=l,e.type!==a.DICE&&(g=Math.floor(g))}return g}function d(a){return"string"==typeof a&&(a=parseFloat(a),isNaN(a))?function(){return!1}:function(b){var c=parseFloat(b.name);return a>=c}}function e(a,b,d){return function(e,f){var g=f.name;f=f.data?f.data:f,f.name=g;var h=_.reduce(f[d],function(d,e){return e.applyOnce&&f.name!==b.name?d:d+c(a,b,e)},0);return e+=h?h:0}}function f(a,b,c){var f=_.chain(a.data.levels).filter(d(b.name)).reduce(e(a,b,c),0).value();return f}function g(a,b,c,f){return _.chain(a.data.levels).filter(d(b.name)).map(function(a){var b={};return b[c]={},b[c][f]=a.data[c][f],b}).reduce(e(a,b,c),0).value()}return{get:f,getMod:g,getValue:c}}]),app.service("bonusService",function(){var a={STATIC:0,ABILITY:1,DYNAMIC:2,STAT:3,BASE_ABILITY:4,DICE:5,POWER_ATTACK_HIT:6,POWER_ATTACK_DMG:7,TWO_WEAPON:8};return a}),app.service("renderService",function(){var a={INLINE:0,HEADER:1,GROUP:2};return a}),app.service("dprService",["statService","targetAcService",function(a,b){function c(a,b,c){return _.reduce(c.hitChance,function(c,d){return c+=g(a,b,d)},0)}function d(a,b,c,d){var e=0,f=0;for(var h in c.damage){var i=c.damage[h],j=g(a,b,i);i.percision?f+=j:e+=j}return e=0>e?0:e,f=0>f?0:f,d?{damage:e,percision:f}:f?e+" and percision: "+f:e}function e(a,e,f){var g,h=parseInt(e.name),i=b[h],j=.05,k=.95,l=0,m=0,n=c(a,e,f),o=d(a,e,f,!0);return l=o.damage,m=o.percision,g=1-(i-n)/20,g=j>g?j:g,g=g>k?k:g,g*(l+m)+f.critThreat*(f.critMultiplier-1)*g*l}function f(a,b,c){return _.reduce(c.attacks,function(c,d){return c+=e(a,b,d)},0)}var g=a.getValue;return{calculateAttackDPR:e,calculateDPR:f,getHit:c,getDmg:d}}]),app.service("targetAcService",function(){return{1:12,2:14,3:15,4:17,5:18,6:19,7:20,8:21,9:23,10:24,11:25,12:27,13:28,14:29,15:30,16:31,17:32,18:33,19:34,20:36}}),app.factory("emptyCharacter",[function(){return function(){return{levels:[],race:"Human","class":"",abilityScores:{strength:10,dexterity:10,constitution:10,intelligence:10,wisdom:10,charisma:10}}}}]),app.factory("emptyLevel",["bonusService",function(a){return function(){return{name:1,attackGroups:[],strength:{increase:{type:a.DYNAMIC,value:0,order:1},"class":{type:a.DYNAMIC,value:0,order:2},enhance:{type:a.DYNAMIC,value:0,applyOnce:!0,order:3},base:{type:a.BASE_ABILITY,value:"strength",applyOnce:!0,order:0}},dexterity:{increase:{type:a.DYNAMIC,value:0,order:1},"class":{type:a.DYNAMIC,value:0,order:2},enhance:{type:a.DYNAMIC,value:0,applyOnce:!0,order:3},base:{type:a.BASE_ABILITY,value:"dexterity",applyOnce:!0,order:0}},constitution:{increase:{type:a.DYNAMIC,value:0,order:1},"class":{type:a.DYNAMIC,value:0,order:2},enhance:{type:a.DYNAMIC,value:0,applyOnce:!0,order:3},base:{type:a.BASE_ABILITY,value:"constitution",applyOnce:!0,order:0}},intelligence:{increase:{type:a.DYNAMIC,value:0,order:1},"class":{type:a.DYNAMIC,value:0,order:2},enhance:{type:a.DYNAMIC,value:0,applyOnce:!0,order:3},base:{type:a.BASE_ABILITY,value:"intelligence",applyOnce:!0,order:0}},wisdom:{increase:{type:a.DYNAMIC,value:0,order:1},"class":{type:a.DYNAMIC,value:0,order:2},enhance:{type:a.DYNAMIC,value:0,applyOnce:!0,order:3},base:{type:a.BASE_ABILITY,value:"wisdom",applyOnce:!0,order:0}},charisma:{increase:{type:a.DYNAMIC,value:0,order:1},"class":{type:a.DYNAMIC,value:0,order:2},enhance:{type:a.DYNAMIC,value:0,applyOnce:!0,order:3},base:{type:a.BASE_ABILITY,value:"charisma",applyOnce:!0,order:0}},ac:{base:{type:a.STATIC,value:10,"flat-footed":!0,touch:!0,applyOnce:!0,order:0},armor:{type:a.DYNAMIC,value:0,"flat-footed":!0,touch:!1,applyOnce:!0,order:1},shield:{type:a.DYNAMIC,value:0,"flat-footed":!0,touch:!1,applyOnce:!0,order:2},dexterity:{type:a.ABILITY,value:"dexterity","flat-footed":!1,touch:!0,title:"Dex",applyOnce:!0,order:3},size:{type:a.DYNAMIC,value:0,"flat-footed":!0,touch:!0,applyOnce:!0,order:4},natural:{type:a.DYNAMIC,value:0,"flat-footed":!0,touch:!1,applyOnce:!0,order:5},deflection:{type:a.DYNAMIC,value:0,"flat-footed":!0,touch:!0,applyOnce:!0,order:6},dodge:{type:a.DYNAMIC,value:0,"flat-footed":!1,touch:!0,applyOnce:!0,order:7},touch:{type:a.DYNAMIC,value:0,"flat-footed":!1,touch:!0,applyOnce:!0,order:8},"flat-footed":{type:a.DYNAMIC,value:0,"flat-footed":!0,touch:!1,applyOnce:!0,order:9}},fortitude:{base:{type:a.DYNAMIC,value:0,order:0},constitution:{type:a.ABILITY,value:"constitution",applyOnce:!0,title:"Ability",order:1},magic:{type:a.DYNAMIC,value:0,applyOnce:!0,order:2},misc:{type:a.DYNAMIC,value:0,applyOnce:!0,order:3}},reflex:{base:{type:a.DYNAMIC,value:0,order:0},dexterity:{type:a.ABILITY,value:"dexterity",applyOnce:!0,title:"Ability",order:1},magic:{type:a.DYNAMIC,value:0,applyOnce:!0,order:2},misc:{type:a.DYNAMIC,value:0,applyOnce:!0,order:3}},will:{base:{type:a.DYNAMIC,value:0,order:0},wisdom:{type:a.ABILITY,value:"wisdom",applyOnce:!0,title:"Abililty",order:1},magic:{type:a.DYNAMIC,value:0,applyOnce:!0,order:2},misc:{type:a.DYNAMIC,value:0,applyOnce:!0,order:3}},dr:{base:{type:a.DYNAMIC,value:0,applyOnce:!0,order:0},"class":{type:a.DYNAMIC,value:0,order:1}},sr:{base:{type:a.DYNAMIC,value:0,order:0},"class":{type:a.DYNAMIC,value:0,order:1},enhance:{type:a.DYNAMIC,value:0,applyOnce:!0,order:2}},hp:{level:{type:a.DYNAMIC,value:0,order:0},constitution:{type:a.ABILITY,value:"constitution",title:"Con",applyOnce:!0,modifier:"name",order:1},favoured:{type:a.DYNAMIC,value:0,order:2},toughness:{type:a.DYNAMIC,value:0,order:3},other:{type:a.DYNAMIC,value:0,order:4}},bab:{"class":{type:a.DYNAMIC,value:0,order:0}},initiative:{dexterity:{type:a.ABILITY,value:"dexterity",applyOnce:!0,order:0,title:"Dex"},"class":{type:a.DYNAMIC,value:0,order:2},misc:{type:a.DYNAMIC,value:0,applyOnce:!0,order:1}},movement:{base:30,armor:30,fly:0,swim:0,climb:0,burrow:0},equipment:[],feats:[],skills:[],"spell-casting":[],abilities:[]}}}]),app.factory("emptyAttackGroup",[function(){return function(){return{attacks:[]}}}]),app.factory("emptyAttack",["bonusService",function(a){return function(){return{weapon:"attack",damage:[{type:a.DICE,value:"1d8",modifier:1,percision:!1},{type:a.ABILITY,value:"strength",modifier:1,percision:!1}],hitChance:[{type:a.STAT,value:"bab"},{type:a.ABILITY,value:"strength"}],critThreat:.05,critMultiplier:2}}}]),app.factory("emptyHit",["bonusService",function(a){return function(){return{type:a.DYNAMIC,value:0}}}]),app.factory("emptyDamage",["bonusService",function(a){return function(){return{type:a.DICE,value:"1d8",modifier:1,percision:!1}}}]),app.directive("inputField",["editService",function(a){return{restrict:"E",templateUrl:"../views/input-field.html",transclude:!0,scope:{cssClass:"=css",type:"=type",editId:"=id",editTarget:"=target",editSource:"=source",title:"=title",step:"=step",onChange:"=oncng"},link:function(b){b.edit=a}}}]),app.directive("inputAbility",["editService","abilityModService",function(a,b){return{restrict:"E",templateUrl:"../views/input-ability.html",transclude:!0,scope:{scores:"=scores",target:"=source"},link:function(c){c.edit=a,c.getAbilityMod=b}}}]),app.directive("character",["abilityScoreService","pointBuyService","emptyLevel","editService",function(a,b,c,d){return{restrict:"E",scope:{character:"=character"},templateUrl:"../views/character.html",controller:["$scope",function(e){function f(){angular.forEach(e.character.data.levels,function(a){a.active=!1})}function g(){var a=_.reduce(e.character.data.levels,function(a,b){var c=parseInt(b.name);return a>c?a:c},0);a++,e.character.data.levels.push({id:a,name:a,active:!0,data:c()})}e.edit=d,e.abilityScores=a,e.pointBuy=b,e.remove=function(a){if(1!==e.character.data.levels.length){var b=e.character.data.levels[a].active;b&&f(),e.character.data.levels.splice(a,1),b&&(e.character.data.levels.length>a?e.character.data.levels[a].active=!0:e.character.data.levels[a-1].active=!0)}},e.add=function(){e.edit.clear(),f(),g()},e.sort=function(){var a=e.character.data.levels;e.character.data.levels=_.sortBy(a,function(a){return parseInt(a.name)})}}]}}]),app.directive("level",[function(){return{restrict:"E",scope:{level:"=level",character:"=character",sort:"=sort"},templateUrl:"../views/level.html",controller:function(){}}}]),app.directive("standardStats",["editService","abilityModService","bonusService","renderService","statService",function(a,b,c,d,e){return{restrict:"E",transclude:!0,scope:{character:"=character",level:"=level"},templateUrl:"../views/standard-stats.html",link:function(f){f.edit=a,f.standardStats=[{title:"Ability",renderType:d.GROUP,items:[{name:"strength",title:"Str"},{name:"dexterity",title:"Dex"},{name:"constitution",title:"Con"},{name:"intelligence",title:"Int"},{name:"wisdom",title:"Wis"},{name:"charisma",title:"Cha"}],additionalColumns:[{name:"mod",title:"Modifier",value:b,order:0,position:0}]},{name:"hp",title:"HP",renderType:d.HEADER},{name:"ac",title:"AC",renderType:d.HEADER},{title:"Saves",renderType:d.GROUP,items:[{name:"fortitude",title:"Fort"},{name:"reflex",title:"Ref"},{name:"will",title:"Will"}]},{name:"initiative",title:"Init",renderType:d.INLINE},{name:"bab",title:"BAB",renderType:d.INLINE},{name:"dr",title:"DR",renderType:d.INLINE},{name:"sr",title:"SR",renderType:d.INLINE}],f.RENDER_TYPE=d,f.BONUS_TYPE=c,f.getStat=e.get,f.getStatMod=e.getMod,f.getValue=e.getValue}}}]),app.directive("standardStatInline",["editService","abilityModService","bonusService","statService",function(a,b,c,d){return{restrict:"E",transclude:!0,scope:{character:"=character",level:"=level",stat:"=stat"},templateUrl:"../views/standard-stats/inline.html",link:function(b){b.edit=a,b.BONUS_TYPE=c,b.getStat=d.get,b.getStatMod=d.getMod,b.getValue=d.getValue}}}]),app.directive("standardStatHeader",["editService","abilityModService","bonusService","statService",function(a,b,c,d){return{restrict:"E",transclude:!0,scope:{character:"=character",level:"=level",stat:"=stat"},templateUrl:"../views/standard-stats/header.html",link:function(b){b.edit=a,b.BONUS_TYPE=c,b.getStat=d.get,b.getStatMod=d.getMod,b.getValue=d.getValue}}}]),app.directive("standardStatGroup",["editService","abilityModService","bonusService","statService",function(a,b,c,d){return{restrict:"E",transclude:!0,scope:{character:"=character",level:"=level",stat:"=stat"},templateUrl:"../views/standard-stats/group.html",link:function(b){b.edit=a,b.BONUS_TYPE=c,b.getStat=d.get,b.getStatMod=d.getMod,b.getValue=d.getValue}}}]),app.directive("attackGroups",["editService","emptyAttackGroup",function(a,b){return{restrict:"E",transclude:!0,scope:{character:"=character",level:"=level"},templateUrl:"../views/attack-group-list.html",controller:["$scope",function(c){function d(){angular.forEach(c.level.data.attackGroups,function(a){a.active=!1})}function e(){f++,c.level.data.attackGroups.push({id:f,name:"attack group "+f,active:!0,data:b()})}var f=0;c.edit=a,c.remove=function(a){c.level.data.attackGroups.length>1&&c.level.data.attackGroups.splice(a,1)},c.add=function(){c.edit.clear(),d(),e()}}]}}]),app.directive("attackGroup",["editService","dprService","emptyAttack",function(a,b,c){return{restrict:"E",transclude:!0,scope:{character:"=character",level:"=level",group:"=group"},templateUrl:"../views/attack-group.html",controller:["$scope",function(d){function e(){angular.forEach(d.group.data.attacks,function(a){a.active=!1})}function f(){g++,d.group.data.attacks.push({id:g,name:"attack "+g,active:!0,data:c()})}var g=0;d.edit=a,d.dpr=b.calculateDPR,d.remove=function(a){d.group.data.attacks.length>1&&d.group.data.attacks.splice(a,1)},d.add=function(){d.edit.clear(),e(),f()}}]}}]),app.directive("attack",["editService","emptyHit","emptyDamage",function(a,b,c){return{restrict:"E",transclude:!0,scope:{character:"=character",level:"=level",group:"=group",attack:"=attack"},templateUrl:"../views/attack.html",controller:["$scope",function(d){d.edit=a,d.hit=b,d.damage=c}]}}]),app.controller("TabsCharacterController",["$scope","emptyCharacter","editService",function(a,b,c){function d(){angular.forEach(a.characters,function(a){a.active=!1})}function e(){f++,a.characters.push({id:f,name:"character "+f,active:!0,data:b()})}a.edit=c;var f=0;a.remove=function(b){a.characters.length>1&&a.characters.splice(b,1)},a.characters=[],a.add=function(){a.edit.clear(),d(),e()},a.add()}]),app.controller("MainCtrl",["$scope","$filter","editService","bonusService",function(a,b,c,d){function e(b,c,e){var f;switch("string"==typeof e.type&&(e.type=parseInt(e.type)),e.type){case d.STATIC:f=e.value;break;case d.DYNAMIC:f=e.value;break;case d.ABILITY:var g=a.getStat(b,c,e.value);f=a.getAbilityMod(g);break;case d.STAT:f=a.getStat(b,c,e.value);break;case d.BASE_ABILITY:f=b.abilityScores[e.value];break;case d.DICE:var h=e.value.split("d");f=(parseInt(h[1])/2+.5)*parseInt(h[0]);break;case d.POWER_ATTACK_HIT:var i=a.getStat(b,c,"bab");f=-1*(Math.floor(i/4)+1);break;case d.POWER_ATTACK_DMG:var j=a.getStat(b,c,"bab");j=Math.floor(j/4)||1,f=e.value?3*j:2*j;break;case d.TWO_WEAPON:f=-2}if("string"==typeof f&&(f=parseFloat(f),f=isNaN(f)?0:f),e.modifier){var k=e.modifier;"string"==typeof k&&(k=c[k]),f*=k,e.type!==d.DICE&&(f=Math.floor(f))}return f}function f(){return{weapon:"attack",damage:[{type:d.DICE,value:"1d8",modifier:1,percision:!1},{type:d.ABILITY,value:"strength",modifier:1,percision:!1}],hitChance:[{type:d.STAT,value:"bab"},{type:d.ABILITY,value:"strength"}],critThreat:.05,critMultiplier:2}}function g(){return{type:d.DYNAMIC,value:0}}function h(){return{type:d.DICE,value:"1d8",modifier:1,percision:!1}}function i(){var a=Math.floor(255*Math.random()),b=Math.floor(255*Math.random()),c=Math.floor(255*Math.random()),d=.5,e=1,f="rgba("+a+","+b+","+c+","+d+")",g="rgba("+a+","+b+","+c+","+e+")";return{fill:f,stroke:g,point:f}}function j(){n&&n.destroy();var b,c=[];for(var d in a.characters){var e=a.characters[d];for(var f in e.levels){var g=e.levels[f];c.push(g.name)}e.colors||(e.colors=i(),e.style={"background-color":e.colors.fill})}c=_.uniq(c),b=_.map(a.characters,function(b){return{label:b.name,fillColor:b.colors.fill,strokeColor:b.colors.stroke,pointColor:b.colors.point,pointStrokeColor:"#FFF",pointHighlightFill:"#FFF",pointHighlighStroke:"#FFF",data:_.map(c,function(c){var d=_.find(b.levels,function(a){return a.level===c});return d?_.reduce(d.attackGroups,function(c,e){var f=a.calculateDPR(b,d,e);return c>f?c:f},0):0})}});var h={labels:c,datasets:b};n=new Chart(o).Line(h),window.setTimeout(function(){n.resize()},1e3)}function k(a,b,c){return _.reduce(c.hitChance,function(c,d){return c+=e(a,b,d)},0)}function l(a,b,c,d){var f=0,g=0;for(var h in c.damage){var i=c.damage[h],j=e(a,b,i);i.percision?g+=j:f+=j}return f=0>f?0:f,g=0>g?0:g,d?{damage:f,percision:g}:g?f+" and percision: "+g:f}function m(b,c,d){var e,f=parseInt(c.name),g=a.targetAc[f],h=.05,i=.95,j=0,m=0,n=k(b,c,d),o=l(b,c,d,!0);return j=o.damage,m=o.percision,e=1-(g-n)/20,e=h>e?h:e,e=e>i?i:e,e*(j+m)+d.critThreat*(d.critMultiplier-1)*e*j}a.edit=c;var n,o=null;a.graphDPR=function(){c.id="graph",window.setTimeout(j,100)},a.importExport=null,a["export"]=function(){a.importExport=b("json")(a.selectedCharacter,4),a.edit.id="export"},a.importStart=function(){a.importExport="",a.edit.id="import"},a.importPaste=function(b){a.importExport=b.target.value},a.importEnd=function(){a.selectedCharacter=angular.fromJson(a.importExport),a.characters[a.selectedCharacterIndex]=a.selectedCharacter,a.edit.id=null},a.copyAttackGroupFromPreviousLevel=function(a,b){var c=parseInt(b.name),d=_.reduce(a.levels,function(a,b){var d=parseInt(b.level),e=parseInt(a.level);return c>d&&(!a||d>e)?b:a},!1);d&&(b.attackGroups=b.attackGroups.concat(angular.copy(d.attackGroups)))},a.selectAttack=function(b,c){a.edit.clear(),b.selectedAttackIndex=c,-1===c?b.selectedAttack=null:b.selectedAttack=b.attacks[c]},a.addAttack=function(b){b.attacks.push(f()),a.selectAttack(b,b.attacks.length-1)},a.removeAttack=function(b,c){b.attacks.splice(c,1),b.selectedAttackIndex===c&&a.selectAttack(b,-1),b.selectedAttackIndex>=c?0===c||0===b.selectedAttackIndex?a.selectAttack(b,0):a.selectAttack(b,b.selectedAttackIndex-1):b.selectedAttackIndex>b.attacks.lenth-1&&a.selectAttack(b,b.attacks.length-1)},a.addHit=function(a){a.hitChance.push(g())},a.removeHit=function(a,b){a.hitChance.splice(b,1)},a.addDmg=function(a){a.damage.push(h())},a.removeDmg=function(a,b){a.damage.splice(b,1)},a.calculateAttackDPR=m,a.calculateDPR=function(a,b,c){return _.reduce(c.attacks,function(c,d){return c+=m(a,b,d)},0)},a.getHit=k,a.getDmg=l,a.abilityScores=["strength","dexterity","constitution","intelligence","wisdom","charisma"],a.pointBuy={3:-4,4:-4,5:-4,6:-4,7:-4,8:-2,9:-1,10:0,11:1,12:2,13:3,14:5,15:7,16:10,17:13,18:17},a.targetAc={1:12,2:14,3:15,4:17,5:18,6:19,7:20,8:21,9:23,10:24,11:25,12:27,13:28,14:29,15:30,16:31,17:32,18:33,19:34,20:36}}]),angular.module("dprCalcApp").controller("ClassListCtrl",["$scope","$http",function(a,b){function c(b){a.classes=a.classes.concat(b)}var d=["acg","crb","apg","uc","um"];a.classes=[];for(var e in d)b.get("data/"+d[e]+"/class-list.json").success(c);a.options={bab:["1","0.75","0.5"],hd:["12","10","8","6"],skills:["8","6","4","2"],saves:["HIGH","LOW"]},a.orderProp="name"}]);