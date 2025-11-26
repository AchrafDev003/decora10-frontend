'use strict';
const modalimagen=document.querySelector("#modal-imagen");
if(modalimagen){
modalimagen.addEventListener('show.bs.modal', function(event){
      
    const enlace=event.relatedTarget;
      const rutaImagen=enlace.getAttribute('data-bs-imagen');
      //construir la imagen
      const imagen=document.createElement("IMG");
      imagen.src=`img/${rutaImagen}.jpg`;
      imagen.classList.add('img-fluid');
      imagen.alt='Imagen Galeria';
      const modalbody=document.querySelector('.modal-body');
      modalbody.appendChild(imagen);


}
);
}
modalimagen.addEventListener('hidden.bs.modal', function(){
    const modalbody=document.querySelector('.modal-body');
      
    modalbody.textContent='';
})


document.addEventListener("DOMContentLoaded", function () {
    const target = document.querySelector(".slogan-container");

    if (!target) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.7 // commence à apparaître quand 30% de l'élément est visible
    });

    observer.observe(target);
  });
