'use strict';var _createClass=function(){function a(b,c){for(var f,d=0;d<c.length;d++)f=c[d],f.enumerable=f.enumerable||!1,f.configurable=!0,'value'in f&&(f.writable=!0),Object.defineProperty(b,f.key,f)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}();function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}var Slide=function(){function a(b){_classCallCheck(this,a),this.options=b,this.content=$('<a class="slide" href="'+b.url+'"></a>'),this.image=$('<div class="image"></div>'),this.image.css('background-image','url("'+b.image+'")'),this.title=$('<p class="slide-title">'+b.title+'</p>'),this.subtitle=$('<p class="slide-subtitle">'+b.subtitle+'</p>'),this.button=$('<button class="slide-button">View '+b.medium+'</button>'),this.baseL=$('<div>').append(this.title).append(this.subtitle),this.baseR=$('<div>').append(this.button),this.base=$('<div class="slide-base c1"></div>').append(this.baseL).append(this.baseR),this.content.append(this.base)}return _createClass(a,[{key:'visible',set:function set(b){this.content.css('opacity',b?1:0).css('pointer-events',b?'auto':'none'),this.image.css('opacity',b?1:0)}}]),a}(),Slideshow=function(){function a(b,c,d,f){var k=this;_classCallCheck(this,a),this.root=b,this.element=c,this.options=f,this.slides=[];for(var j,g=0,h=d.length;g<h;g++)j=new Slide(d[g]),this.slides.push(j),this.element.append(j.content),this.root.prepend(j.image);this.left=$('<button class="reverse c1" type="button"></button>').html('<span class="fas fa-chevron-left"></span>').on('click',function(){return k.reverse()}),this.right=$('<button class="forward c1" type="button"></button>').html('<span class="fas fa-chevron-right"></span>').on('click',function(){return k.forward()}),this.element.append(this.left).append(this.right),this.active=0}return _createClass(a,[{key:'resume',value:function resume(){this.active=this.activeId}},{key:'suspend',value:function suspend(){this.timer&&clearTimeout(this.timer)}},{key:'forward',value:function forward(){this.active===this.slides.length-1?this.active=0:this.active+=1}},{key:'reverse',value:function reverse(){0===this.active?this.active=this.slides.length-1:this.active-=1}},{key:'active',get:function get(){return this.activeId},set:function set(b){var f=this;this.activeId=b,this.timer&&clearTimeout(this.timer);for(var c=0,d=this.slides.length;c<d;c++)this.slides[c].visible=c===b;this.timer=setTimeout(function(){return f.forward()},this.options.interval)}}]),a}(),works=new Slideshow($('body'),$('#works'),[{title:'Boom, Bust, and Renewal',subtitle:'Growth and demise in urban areas throughout American history',medium:'Application',image:'./slides/boom-bust-renewal.png',url:'./projects/boom-bust-renewal/'},{title:'A Slient Flight',subtitle:'Shifting populations in the United States',medium:'Infographic',image:'./slides/a-silent-flight.png',url:'./projects/a-silent-flight.png'},{title:'Sharing the Glass',subtitle:'Water and sanitation availability in Africa and South Asia<br><a class="award" href="http://nacis.org/awards/student-dynamic-map-competition/"><span class="fas fa-award"></span>2018 Winner &ndash; NACIS Student Dynamic Mapping Competition</a>',medium:'Application',image:'./slides/sharing-the-glass.png',url:'./projects/sharing-the-glass/'}],{interval:6e3}),nav={elements:{works:$('div[data-for="works"]'),resume:$('div[data-for="resume"]'),contact:$('div[data-for="contact"]')},set active(a){this.activeId&&a===this.activeId||(this.activeId=a,$.each(this.elements,function(b,c){var d=c.children('.underline');b===a?d.css('width','100%'):d.css('width','0')}))}},_loop=function(a){nav.elements[a].on('click',function(){return scrollToSection(a)})};for(var a in nav.elements)_loop(a);function getElementBounds(){return{window:{height:$(window).height()},body:$('body').get(0).getBoundingClientRect(),header:$('header').get(0).getBoundingClientRect(),resume:$('#resume').get(0).getBoundingClientRect(),contact:$('#contact').get(0).getBoundingClientRect()}}var elementBounds=getElementBounds();function scrollToSection(a){'works'===a?$('#works').get(0).scrollIntoView():'resume'===a?elementBounds.header.height+elementBounds.resume.height<elementBounds.window.height?window.scroll(0,elementBounds.body.height-elementBounds.window.height-elementBounds.contact.height):window.scroll(0,elementBounds.window.height-elementBounds.header.height):'contact'==a&&$('#contact').get(0).scrollIntoView()}function setActive(){var a=$('body').get(0).getBoundingClientRect();a.bottom-10<elementBounds.window.height?(nav.active='contact',$('.slide-base, .reverse, .forward').addClass('hidden')):-a.top>elementBounds.window.height/2-elementBounds.header.height?(nav.active='resume',$('.slide-base, .reverse, .forward').addClass('hidden')):(nav.active='works',$('.slide-base, .reverse, .forward').removeClass('hidden'))}$(window).on('load',function(){$(window).on('resize',function(){return elementBounds=getElementBounds()}),$(document).on('scroll',function(){return setActive()}),setTimeout(function(){return setActive()},1500)});