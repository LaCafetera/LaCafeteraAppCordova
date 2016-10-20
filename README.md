# LaCafeteraAppCordova

APP La Cafetera - Cordova

Prototipo de aplicación para smartphones para escuchar el programa 'La Cafetera' alojado en Spreaker usando Cordova.

El objetivo de este prototipo es ver la viabilidad de Cordova para desarrollar una applicación multiplataforma para La Cafetera.

Este prototipo debe ser capaz de ofrecer dos funcionalidades básicas:

    Obtener un listado de episodios de forma asíncrona.
    Reproducir en streaming cualquiera de ellos.

En esta página se encuentra la descripción sobre la API de Spreaker: https://developers.spreaker.com/api/

#Cordova

https://cordova.apache.org/

Cordova permite a partir de una aplicación HTML5 + CSS3 + JAVASCRIPT crear Apps para distintas plataformas, Android, iOS, etc.

Para el comportamiento Javascript se utiliza la librería cordova-jquery

https://www.npmjs.com/package/cordova-jquery/tutorial


#Uso básico de Cordova

Para la instalación del framework es necesario tener instalada la librería Node.js (https://nodejs.org) tanto par Linux como para Windows.

Tan sólo hay que seguir las instrucciones de la página de Cordova, siguiendo los pasos "Create your first Cordova app"

Una vez instalado y para el primer propósito de construir un prototipo instalaremos el framework "jquery-mobile" de la siguiente manera:

$ npm install cordova-jquery -g (-g indica instalar de manera global en el sistema)

Una vez instalado ejecutaremos en el directorio del proyecto:

$ cordova-jquery

Con esto se instalará en el directorio www las librerías jquery.

Nuestro trabajo se realizará dentro de la carpeta www donde modificaremos los html, css y js necesarios para construir la aplicación.

#Test

Para realizar test en nuestro móvil utilizaremos phonegap (phonegap es el nombre que tiene cordova dado por adobe, para ver las diferencias
entre estas dos nomenclaturas ver http://www.ceroyuno.es/phonegap-vs-apache-cordova-resolviendo-diferencias/)

$ npm install phonegap

Dentro del directorio raíz de la aplicación ejecturamos 

$ phonegap serve

Y utilizaremos la aplicación phonegap de nuestro móvil (que deberemos instalar) para conectarnos a la ip del pc de desarrollo para testear el comportamiento de la aplicación)


