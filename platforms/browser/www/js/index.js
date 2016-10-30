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
   // as soon as this function is called File "should" be defined
   inicializa();
}


   function inicializa(){
        var elementos;
        var audio_en_rep="0";
        var posicion=0;
        var reproductor;
        var reproduciendo=0;
        var descargando = false;
        console.log("Entrando en inicializa");
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
                $("#fberlin").html(cadena).listview('refresh');
            });

            elementos.forEach(function( val ) {
                var minutos =  Math.round((val.duration/1000)%60).toString();
                if (minutos.length == 1) {
                    minutos = '0'+minutos
                }
                if (i == 0) {
                    cadena = "<li class=\"episodios\" id=\"" + i++ + "\">";
                } else {
                    cadena = "<li class=\"episodios\" id=\"" + i++ + "\" data-mini=\"true\">";
                }
                cadena += "<a href=\"#capitulo\">" +
                         "<img src="+val.image_url.replace("\/","/")+">"+
                         "<h3>" + val.title.substring(0, 50) + "</h3>"+
                         "<p>" + Math.floor((val.duration/1000)/60) +":"+ minutos + "</p>"+
                         "</a></li>";
                         //console.log(cadena);
                $("#listado").append(cadena).listview('refresh');

            }); // fin de forEach
        }); // fin de getJSON

        $("#listado").delegate('.episodios','click',function(){
            posicion = this.id;
            episodio_id = elementos[posicion].episode_id;
            $.getJSON( "https://api.spreaker.com/v2/episodes/"+episodio_id, function( data ) {
                var elementosCapitulo = data.response.episode;//.slice();
                $("#imagen2").html("<img align=center src="+elementosCapitulo.image_url.replace("\/","/")+" >");
                $("#tituloPag2").html("<p><h2 align=\"center\">"+ elementosCapitulo.title + "</h2></p>");
                $("#fechaEmision").html("<p><h3  align=\"center\">"+ elementosCapitulo.published_at + "</h3></p>");
                audio_en_rep = "https://api.spreaker.com/listen/episode/"+episodio_id+"/http";
                reproductor = new Media(encodeURI(audio_en_rep), function(){console.log("comenzando reproduccion")},
                                                                 function(err){console.log("Error en reproduccion" + err.code)},
                                                                 function(msg){reproduciendo = msg});
            });
         //   $.mobile.changePage($("#capitulo"), { transition: "slideup"} );
        }); // final click episodio

        $("#descarga").click(function(){
            episodio_id = elementos[posicion].episode_id;
            var fileTransfer = new FileTransfer();
            var audio_en_rep = "https://api.spreaker.com/listen/episode/"+episodio_id+"/http";
            var uri = encodeURI(audio_en_rep);
            //var fileURL =  "///storage/sdcard/Podcasts/"+episodio_id+".mp3"; // emulador
            //var fileURL =  "///storage/emulated/0/Podcasts/"+episodio_id+".mp3"; // móvil
            var fileURL =  cordova.file.dataDirectory + episodio_id + ".mp3";

            fileTransfer.onprogress = function(progressEvent) {
                if (progressEvent.lengthComputable) {
            	    var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
            		$("#pctDesc").html("<p>Descargado " + perc + "%...<p>");
            		//$("ft-prog").value = perc;
            		//$("slider-descarga").val(perc).slider("refresh");
            	} else {
            	    if($("#pctDesc").html() == "") {
            		    $("#pctDesc").html("Descargando...");
            		} else {
            		    $("#pctDesc").html($("#pctDesc").html()+ ".") ;
            		}
            	}
            }; // fin onprogress

            if (!descargando){
                descargando = true;
            	$("#descarga").html("Cancelar descarga");
                console.log("Comenzando la descarga del fichero "+ audio_en_rep);
                $("#pctDesc").html("");
                fileTransfer.download(
                    uri, fileURL, function(entry) {
                    console.log("download complete: " + entry.toURL());
                },
                function(error) {
                    console.log("download error source " + error.source);
                    console.log("download error target " + error.target);
                    console.log("download error code" + error.code);
                    // ESto lo pongo aquí porque cuando cancelo la descarga la ejecución pasa por aquí. Así nos aseguramos de verdad de que la descarga ha terminado.
                    $("#descarga").html("Descargar");
                    descargando = false;
                    $("#pctDesc").html("");
                },
                false, {
                    headers: {
                        "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                    }
                })
            }
            else {
                fileTransfer.abort();
            }
        }); //fin ("#descarga").click


        $("#buttonplay").click(function(){
            console.log ("Estado rep "  + reproduciendo);
            if (reproduciendo == Media.MEDIA_RUNNING ) {
                reproductor.pause();
                $("#buttonplay").html("Play") ;
                reproduciendo = false;
            } else {
                reproductor.play();
                $("#buttonplay").html("Pausa") ;
