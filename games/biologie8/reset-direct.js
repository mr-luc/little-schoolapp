// Robuster Neustart ohne Texteingabe
// Ersetzt den Button vollständig, damit alte onclick-Handler mit Prompt sicher entfernt werden.
(function(){
  function setupDirectRestart(){
    var oldButton=document.getElementById('reset');
    if(!oldButton)return;

    var newButton=oldButton.cloneNode(true);
    oldButton.parentNode.replaceChild(newButton,oldButton);

    newButton.addEventListener('click',function(event){
      event.preventDefault();
      event.stopPropagation();

      try{
        localStorage.removeItem('little-bio8-progress-v4');
        localStorage.removeItem('little-bio8-progress-v3');
        localStorage.removeItem('little-bio8-progress-v2');
        localStorage.removeItem('little-bio8-progress');
      }catch(e){}

      window.location.href=window.location.pathname+'?reset='+Date.now();
    });
  }

  setupDirectRestart();
  document.addEventListener('DOMContentLoaded',setupDirectRestart);
  window.addEventListener('load',setupDirectRestart);
})();
