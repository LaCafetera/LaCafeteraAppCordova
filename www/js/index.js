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

        $.getJSON( "https://api.spreaker.com/v2/shows/1060718/episodes?limit=15", function( data ) {
            var items = [];
            var cadena ='';
            var i=0;
            elementos = data.response.items.slice();
            elementos.forEach(function( val ) {
                cadena = "<li class=\"episodios\" id=\"" + i++ + "\">" + val.title.substring(0, 50) + "</li>";
                $("#listado").append(cadena);
            }); // fin de forEach
            $("#imagen").html("<img align=\"center\" src="+elementos[0].image_url.replace("\/","/")+">");
        }); // fin de getJSON

        $("#listado").delegate('.episodios','click',function(){
            posicion = this.id;
            $("#imagen").html("<img align=center src="+elementos[posicion].image_url.replace("\/","/")+" >");
            $("#imagen2").html("<img align=center src="+elementos[posicion].image_url.replace("\/","/")+" >");
            episodio_id = elementos[posicion].episode_id;
            audio_en_rep = "https://api.spreaker.com/listen/episode/"+episodio_id+"/http";
            reproductor = new Media(encodeURI(audio_en_rep), function(){console.log("comenzando reproduccion")},
                                                             function(err){console.log("Error en reproduccion" + err.code)},
                                                             function(msg){reproduciendo = msg; console.log("Estado de la reproduccion" + reproduciendo)});
        }); // final click episodio

        $("#descarga").click(function(){
            episodio_id = elementos[posicion].episode_id;
            var fileTransfer = new FileTransfer();
            var audio_en_rep = "https://api.spreaker.com/listen/episode/"+episodio_id+"/http";
            var uri = encodeURI(audio_en_rep);
            var fileURL =  "///storage/sdcard/Podcasts/"+episodio_id+".mp3"; // emulador
            //var fileURL =  "///storage/emulated/0/Podcasts/"+episodio_id+".mp3"; // móvil

            fileTransfer.onprogress = function(progressEvent) {
                if (progressEvent.lengthComputable) {
            	    var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
            		$("#pctDesc").html("<p>Descargado " + perc + "%...<p>");
            	} else {
            	    if($("#pctDesc").html() == "") {
            		    $("#pctDesc").html("Descargando...");
            		} else {
            		    $("#pctDesc").html($("#pctDesc").html()+ ".") ;
            		}
            	}
            }; // fin onprogress

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
            },
            false, {
                headers: {
                    "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                }
            })
        }); //fin ("#descarga").click


        $("#play").click(function(){
            if (reproduciendo == Media.MEDIA_RUNNING ) {
                reproductor.pause();
                $("#buttonplay").html("Reproducir") ;
                reproduciendo = false;
            } else {
                reproductor.play();
                $("#buttonplay").html("Pausa") ;
                reproduciendo = true;
            }
        });
    }

/****************************** directorio ************************************/

