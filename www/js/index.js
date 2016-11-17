/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize(); */
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
   console.log(FileTransfer);
   console.log(Media);
   inicializa();
}

    function ficheroExiste2 (fichero){
        var lector = new FileReader();
        var existe = true;
        console.log("El fichero es:" + fichero);

        lector.onloadend = function(evt) {
            if(evt.target.result == null) {
               existe = false;
            }
        };
        lector.readAsDataURL(fichero);
        console.log("El fichero existe:" + existe);
        return (existe);
    }


    function ficheroExiste(fichero){
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem){
            fileSystem.getFile(fichero, { create: false }, fileExists, fileDoesNotExist);
        }, getFSFail); //of requestFileSystem
    }
    function fileExists(fileEntry){
        console.log("File " + fileEntry.fullPath + " exists!");
        return (true);
    }
    function fileDoesNotExist(){
        console.log("file does not exist");
        return (false);
    }
    function getFSFail(evt) {
        console.log(evt.target.error.code);
        alert("Errorrrr");
        return (false);
    }


   function inicializa(){
        var elementos;
        var audio_en_rep="0";
        var fichero_en_rep = "";
        var enlace = "";
        var posicion=0;
        var reproductor;
        var reproduciendo=0;
        var descargando = false;
        var descargado = false;
        var titulo ;
        var fileTransfer;// = new FileTransfer();
        var pos_reproduccion;
        var tipoEmision;

        $("#barra_reprod").find('input').hide();
        $("#barra_reprod").find('input').css('margin-left','15px'); // Fix for some FF versions
        $("#barra_reprod").find('.ui-slider-track').css('margin','0 15px 0 15px');
        $('#slider-descarga').hide();

        function numerosDosCifras( numero) {
            var ret = "00";
            if (!isNaN(numero)){
                if (numero < 10){
                    ret = '0' + numero;
                }
                else {
                    ret = numero.toString();
                }
            }
            return (ret);
        }

        function dameTiempo(totSegundos){
            var horas = Math.floor(totSegundos / 3600);
            var minutos = Math.floor((totSegundos % 3600) / 60);
            var segundos = (totSegundos % 60);
            return (numerosDosCifras (horas) + ':' + numerosDosCifras (minutos) + ':' + numerosDosCifras (segundos));
        }

        function borrarDescarga (fichero) {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem) {
            	fileSystem.getFile(fichero, {create:false}, function(fileEntry) {
                    fileEntry.remove(function(){
                        alert("La descarga se ha borrado");
                        console.log ("La descarga se ha borrado");
                    },function(error){
                        alert("Error borrando descarga: " + error);
                        console.log ("Error borrando descarga. Fichero: " + fichero +"; error: " + error);
                    },function(){
                        alert("No encuentro el fichero. :-S");
                    });
            	});
            });
        }


        function inicializaReproductor(fichero){
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem){
                fileSystem.getFile(fichero, { create: false }, fileExists, fileDoesNotExist);
            }, getFSFail); //of requestFileSystem
        }
        function fileExists(fileEntry){
            console.log("El fichero existe. Reproduciremos fichero local")
            console.log("Reproductor:" + reproductor);
            if (typeof(reproductor) != 'undefined'){
                reproductor.release();
            }
            $("#descarga").removeClass("ui-icon-arrow-d ui-icon-cloud").addClass("ui-icon-cloud");
            reproductor = new Media(encodeURI(fichero_en_rep), function(){console.log("comenzando reproduccion fichero local")},
                                                             function(err){console.log("Error en reproduccion" + err.code)},
                                                             function(msg){reproduciendo = msg});
             descargado = true;
        }
        function fileDoesNotExist(){
            console.log("El fichero NO existe. Reproduciremos por streaming")
            $("#descarga").removeClass("ui-icon-arrow-d ui-icon-cloud").addClass("ui-icon-arrow-d");
            console.log("Reproductor:" + reproductor);
            if (typeof(reproductor) != 'undefined'){
                reproductor.release();
                console.log ("Eliminando instancia de reproductor");
            }
            else
            {
                console.log ("No se elimina la instancia de reproductor");
            }
            reproductor = new Media(encodeURI(audio_en_rep), function(){console.log("comenzando reproduccion streaming")},
                                                             function(err){console.log("Error en reproduccion" + err.code)},
                                                             function(msg){reproduciendo = msg});
            descargado = false;
        }
        function getFSFail(evt) {
            console.log(evt.target.error.code);
            alert("Errorrrr");
        }

        $.getJSON( "https://api.spreaker.com/v2/shows/1060718/episodes", function( data ) { //?limit=15
            var items = [];
            var cadena ='';
            var i=0;
            elementos = data.response.items.slice();
            $.getJSON( "https://api.spreaker.com/v2/users/"+elementos[0].author_id, function( dataUser ) {
                var datosFB=dataUser.response.user;
                cadena = "<li><img src="+datosFB.image_url.replace("\/","/")+">"+
                         "<h3>" + datosFB.fullname + "</h3>"+
                         "<p>" + datosFB.followers_count +" Followers.</p></li>";
                $("#fberlin").html(cadena).listview().listview('refresh');
            });

            elementos.forEach(function( val ) {
                titulo = val.title;
                cadena = "<li class=\"episodios\" id=\"" + i++ + "\">" +
                         "<a href=\"#capitulo\">" +
                         "<img src="+val.image_url.replace("\/","/")+">"+
                         "<h3>" + val.title + "</h3>"+
                         "<p>" + dameTiempo(Math.floor(val.duration/1000)) + "</p>"+
                         "</a></li>";
                         //console.log(cadena);
                $("#listado").append(cadena);
            }); // fin de forEach
            $("#listado").listview('refresh');
        }); // fin de getJSON

        $("#listado").delegate('.episodios','click',function(){
            var milisegundosPorDia = 86400000;
            var ahora = Date.now();
            var dias;
            var cadenaDias;
            posicion = this.id;
            episodio_id = elementos[posicion].episode_id;
            $.getJSON( "https://api.spreaker.com/v2/episodes/"+episodio_id, function( data ) {
                var elementosCapitulo = data.response.episode;
                var fecha = new Date (elementosCapitulo.published_at);
                dias = Math.floor((ahora - fecha.getTime())/milisegundosPorDia);
                console.log ("Calculando cuántos días es " + (ahora - fecha.getTime())/milisegundosPorDia);
                if (dias == 1) {
                    cadenaDias = "Hace 1 dia"
                }
                else {
                    cadenaDias = "Hace " + dias + " dias"
                }
                $("#imagen2").html("<img align=center src="+elementosCapitulo.image_url+" >");
                $("#tituloPag2").html("<p><h2 align=\"center\">"+ elementosCapitulo.title + "</h2></p><p><h3 align=\"center\">"+ cadenaDias + "</h3></p>");
                audio_en_rep = "https://api.spreaker.com/listen/episode/"+episodio_id+"/http";
                fichero_en_rep = cordova.file.dataDirectory + episodio_id + ".mp3";
                inicializaReproductor (episodio_id + ".mp3");
                titulo = elementosCapitulo.title;
                imagen = elementosCapitulo.image_url.replace("\/","/");
                enlaceEpisodio = "https://www.spreaker.com/episode/"+episodio_id;
                tipoEmision = elementosCapitulo.type;
                $("#slider-rep").slider("refresh");
            });
            $.getJSON( "https://api.spreaker.com/v2/episodes/"+episodio_id+"/messages", function( dataMsg ) {
                var items = [];
                var cadenaIni ='<thead><tr><th></th><th></th></tr></thead><tbody id="Chat">';
                var cadena = '';
                var cadenaFin = '</tbody>';
                var i=0;
                var imagenAutor;
                mensaje = dataMsg.response.items.slice();
                mensaje.forEach(function( val ) {
                    if (val.author_image_url == null){
                        imagenAutor = 'img/logo.png';
                    }
                    else {
                        imagenAutor = val.author_image_url;
                    }
                    cadena += "<tr><td><img src="+imagenAutor+" width=\"50\" height=\"50\"></td>"+
                             "<td style=\"background-color:#ccc; margin:5px\"><b>" + val.author_fullname + "</b> ("+ val.created_at + ")" + //"<p class=\"ui-li-aside ui-li-count\">" + val.created_at + "</p>" +
                             "<p>" + val.text +"</p></td></tr>";
                }); // fin de forEach
                $('<table>').attr({'data-role':'table','class':'ui-responsive table-stroke table-stripe',id:'tablaChat'}).html(cadenaIni+cadena+cadenaFin).appendTo("#Chat");
                $("#tablaChat").table().table("refresh");
            }); //final getJSON (chat)
        }); // final click episodio

        $( "#slider-rep" ).on( 'slidestart', function(event) {alert ("kietorrla")} );
        $( "#slider-rep" ).on( 'slidestop', function(event) {alert ("kietorrl")} );

        $("#descarga").click(function(){
            episodio_id = elementos[posicion].episode_id;
            var audio_en_desc = "https://api.spreaker.com/download/episode/"+episodio_id+"/.mp3";
            var uri = encodeURI(audio_en_desc);
            var fileURL =  cordova.file.dataDirectory + episodio_id + ".mp3";
            if (descargado == false){
                if (!descargando) {
                    fileTransfer = new FileTransfer();
                }
                fileTransfer.onprogress = function(progressEvent) {
                    if (progressEvent.lengthComputable) {
                        var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                        document.getElementById("slider-descarga").value = perc;
                    }
                }; // fin onprogress

                if (!descargando){
                    descargando = true;
                    console.log("Comenzando la descarga del fichero "+ enlaceEpisodio);
                    document.getElementById("slider-descarga").value = 0;
                    $('#slider-descarga').show();

                    //document.getElementById("barra_descarga").style.display = 'block';

                    fileTransfer.download( uri, fileURL,
                        function(entry) {
                            alert("Descargarga completa.");
                            $('#slider-descarga').hide();
                            if (reproduciendo != Media.MEDIA_RUNNING && reproduciendo != Media.MEDIA_STARTING ){
                                inicializaReproductor (episodio_id + ".mp3");
                            }
                        },
                        function(error) {
                            console.log("download error source " + error.source);
                            console.log("download error target " + error.target);
                            console.log("download error code" + error.code);
                            // ESto lo pongo aquí porque cuando cancelo la descarga la ejecución pasa por aquí. Así nos aseguramos de verdad de que la descarga ha terminado.
                            descargando = false;
                            $('#slider-descarga').hide();
                        },
                        false, {
                            headers: {
                                "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                            }
                        })
                }
                else {
                    fileTransfer.abort();
                    console.log("Abortando descarga");
                }
            }
            else // El usuario da al botón de descarga cuando el fichero ya había sido descargado.
            {
                if (confirm('El fichero ya ha sido descargado. \n ¿Desea borrarlo?')) {
                    borrarDescarga(episodio_id + ".mp3");
                    reproductor.stop();
                    inicializaReproductor (episodio_id + ".mp3");
                } else {
                    console.log("Rechazada opción de borrado.")
                }
            }
        }); //fin ("#descarga").click


        $("#buttonPlay").click(function(){
            console.log ("Estado rep "  + reproduciendo);
            if (reproduciendo == Media.MEDIA_RUNNING || reproduciendo == Media.MEDIA_STARTING ) {
                reproductor.pause();
                reproduciendo = false;
                clearInterval(pos_reproduccion);
            } else {
                if (tipoEmision == "LIVE") {
                    reproductor.seek(reproductor.getDuration()*1000);
                }
                reproductor.play();
                pos_reproduccion = setInterval(function () {
                                       // get media position
                                       reproductor.getCurrentPosition(
                                           // success callback
                                           function (position) {
                                                if (position > -1) {
                                                    var posicion = dameTiempo(Math.round(position));
                                                    console.log ("Reproductor por " + posicion);
                                                    //$("#slider-rep").closest(".ui-slider").find(".ui-slider-handle").text(posicion);
                                                    $("#slider-rep-lab").html(posicion);
                                                }
                                           },
                                           // error callback
                                           function (e) {
                                               console.log("Error getting pos=" + e);
                                           }
                                       );
                                   }, 1000);
               // $("#buttonPlay").html("Pausa") ;
            }
        }); //fin buttonPlay.click

        $("#buttonComparte").click(function(){
            console.log ("Compartir es muy bonito ");

            var options = {
              message: titulo, // not supported on some apps (Facebook, Instagram)
              subject: 'Creo que esto puede interesarte.', // fi. for email
              files: [], //[imagen], // an array of filenames either locally or remotely
              url: enlaceEpisodio,
              chooserTitle: 'Selecciona aplicación.' // Android only, you can override the default share sheet title
            }

            var onSuccess = function(result) {
              console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
              console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
            }

            var onError = function(msg) {
              console.log("Sharing failed with message: " + msg);
            }

            window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);

        }); // fin buttonComparte.click


        $("#buttonLike").click(function(){
            alert ("Me alegro de que te guste");
        });

        $("#buttonChat").click(function(){
            alert ("Chateando que es gerundio.");
        });
    }