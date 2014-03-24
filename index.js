var util = require("util");
var events = require("events");

function Shell(container, opts){
  events.EventEmitter.call(this);

  opts = opts || {};

  this.destroyable = opts.destroyable || false;
  this.closable = opts.closable || false;
  this.container = container;
  this.headerTag = opts.headerTag || 'h3';
  this.opened = undefined;

  Array.prototype.forEach.call(this.container.getElementsByTagName(this.headerTag), function(el){
    this.init(el);
  }, this);

  this.container.addEventListener('click', function(e) {
    if(e.target && e.target.tagName === this.headerTag.toUpperCase()) {
      e.target.classList.toggle('shell-open');

      var wrapper = e.target.nextElementSibling;

      if(wrapper.style.maxHeight === '0px'){
        wrapper.style.maxHeight = wrapper.firstElementChild.getBoundingClientRect().height*2 + 'px'; //http://stackoverflow.com/questions/3508605/css-transition-height-0-to-height-auto
        if(this.opened && this.opened !== e.target) {
          this.opened.nextElementSibling.style.maxHeight = '0px';
          this.opened.nextElementSibling.classList.remove('shell-open');
          this.opened.classList.remove('shell-open');
        }
        this.opened = e.target;
      } else {
        wrapper.style.maxHeight = '0px';
      }

      wrapper.classList.toggle('shell-open');
    } else if (e.target.classList.contains('shell-destroy')) {

      e.preventDefault();

      var id = e.target.parentNode.id
        , accHeader = e.target.parentNode
        , accContent = accHeader.nextElementSibling;

      var section = accHeader.parentNode;

      if(this.opened && this.opened === accHeader) {
        this.opened = undefined;
      }
      section.removeChild(accHeader);
      section.removeChild(accContent);

      this.emit('removed', id);
    } else if (e.target.classList.contains('shell-close')){
      e.preventDefault();
      //find closest h3
      var el = e.target;
      while( !(el = el.parentNode).classList.contains('shell-entry') );
      el.previousElementSibling.click();
    }
  }.bind(this));

};

util.inherits(Shell, events.EventEmitter);

Shell.prototype.init = function(headerElement){

  //add destroy
  if(this.destroyable){
    headerElement.insertAdjacentHTML('beforeend', '<a class="shell-destroy" title="destroy" href="#">&times;</a>');
  }

  var content = headerElement.nextElementSibling;
  content.classList.add('shell-content');
  //add close
  if(this.closable){
    content.insertAdjacentHTML('afterbegin', '<a class="shell-close" title="close" href="#">&times;</a>');
  }

  //wrap content into a div so that we know the size (for CSS3 transition)...
  var parent = content.parentNode;
  var wrapper = document.createElement('div');
  wrapper.classList.add('shell-entry');

  // set the wrapper as child (instead of the element)
  parent.replaceChild(wrapper, content);
  // set element as child of wrapper
  wrapper.appendChild(content);

  wrapper.style.maxHeight = '0px';

  this.emit('added', headerElement.id);
};

Shell.prototype.append = function(id, html){
  var section = this.container.querySelector('#' + id);

  var liveSel = section.getElementsByTagName(this.headerTag);
  var offset = liveSel.length;
  section.insertAdjacentHTML('beforeend', html);
  for(var i=offset; i<liveSel.length; i++){
    this.init(liveSel[i]);
  }
};


module.exports = Shell;
