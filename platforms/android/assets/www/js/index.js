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


   function inicializa(){
        var elementos;
        var audio_en_rep="0";
        var enlace = "";
        var posicion=0;
        var reproductor;
        var reproduciendo=0;
        var descargando = false;
        var titulo ;
        var fileTransfer;// = new FileTransfer();
        var pos_reproduccion;

        $(".barra").find('input').hide();
        $(".barra").find('input').css('margin-left','15px'); // Fix for some FF versions
        $(".barra").find('.ui-slider-track').css('margin','0 15px 0 15px');
        $(".barra").find('.ui-slider-handle').hide();
        $('.slider').slider();
        //$("#slider-descarga").slider("refresh");
        document.getElementById("barra_descarga").style.display = 'none';

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
                titulo = val.title;
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
                $("#listado").append(cadena);
            }); // fin de forEach
            $("#listado").listview('refresh');
        }); // fin de getJSON

        $("#listado").delegate('.episodios','click',function(){
            posicion = this.id;
            episodio_id = elementos[posicion].episode_id;
            $.getJSON( "https://api.spreaker.com/v2/episodes/"+episodio_id, function( data ) {
                var elementosCapitulo = data.response.episode;//.slice();
                $("#imagen2").html("<img align=center src="+elementosCapitulo.image_url+" >");
                $("#tituloPag2").html("<p><h2 align=\"center\">"+ elementosCapitulo.title + "</h2></p>");
                $("#fechaEmision").html("<p><h3 align=\"center\">"+ elementosCapitulo.published_at + "</h3></p>");
                audio_en_rep = "https://api.spreaker.com/listen/episode/"+episodio_id+"/http";
                reproductor = new Media(encodeURI(audio_en_rep), function(){console.log("comenzando reproduccion")},
                                                                 function(err){console.log("Error en reproduccion" + err.code)},
                                                                 function(msg){reproduciendo = msg});
                titulo = elementosCapitulo.title;
                imagen = elementosCapitulo.image_url.replace("\/","/");
                enlaceEpisodio = "https://www.spreaker.com/episode/"+episodio_id;
            });
            $.getJSON( "https://api.spreaker.com/v2/episodes/"+episodio_id+"/messages", function( dataMsg ) {
                var items = [];
                var cadena ='';
                var i=0;
                var imagenAutor;
                mensaje = dataMsg.response.items.slice();
                $("#Chat").empty();
                mensaje.forEach(function( val ) {
                    if (val.author_image_url == null){
                        imagenAutor = 'img/logo.png';
                    }
                    else {
                        imagenAutor = val.author_image_url;
                    }
                    cadena = "<tr><td><img src="+imagenAutor+" width=\"50\" height=\"50\"></td>"+
                             "<td style=\"background-color:#ccc; margin:5px\"><b>" + val.author_fullname + "</b> ("+ val.created_at + ")" + //"<p class=\"ui-li-aside ui-li-count\">" + val.created_at + "</p>" +
                             "<p>" + val.text +"</p></td></tr>";
                    $("#Chat").append(cadena);//.listview('refresh');
                }); // fin de forEach
                $("#tablaChat").table("rebuild");
            }); //final getJSON (chat)
            //$("#Chat").listview('refresh');
        }); // final click episodio

        $("#descarga").click(function(){
            episodio_id = elementos[posicion].episode_id;
            var audio_en_desc = "https://api.spreaker.com/download/episode/"+episodio_id+"/.mp3";
            var uri = encodeURI(audio_en_desc);
            var fileURL =  cordova.file.dataDirectory + episodio_id + ".mp3";
            if (!descargando) {
                fileTransfer = new FileTransfer();
            }
            fileTransfer.onprogress = function(progressEvent) {
                if (progressEvent.lengthComputable) {
            	    var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
            		$("#slider-descarga").val(perc).slider("refresh");
                    $("#slider-descarga").closest(".ui-slider").find(".ui-slider-handle").text(perc+"%");
            	}
            }; // fin onprogress

            if (!descargando){
                descargando = true;
                console.log("Comenzando la descarga del fichero "+ enlaceEpisodio);

                document.getElementById("barra_descarga").style.display = 'block';

                fileTransfer.download(
                    uri, fileURL, function(entry) {
                    console.log("Descargando ");
                },
                function(error) {
                    console.log("download error source " + error.source);
                    console.log("download error target " + error.target);
                    console.log("download error code" + error.code);
                    // ESto lo pongo aquí porque cuando cancelo la descarga la ejecución pasa por aquí. Así nos aseguramos de verdad de que la descarga ha terminado.
                    descargando = false;
                    $("#slider-descarga").closest(".ui-slider").find(".ui-slider-handle").text("0 %");
                    document.getElementById("barra_descarga").style.display = 'none';
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
        }); //fin ("#descarga").click


        $("#buttonPlay").click(function(){
            console.log ("Estado rep "  + reproduciendo);
            if (reproduciendo == Media.MEDIA_RUNNING ) {
                reproductor.pause();
                console.log ("Reproductor en Pausa");
               // $("#buttonPlay").html("Play") ;
                reproduciendo = false;
                clearInterval(pos_reproduccion);
            } else {
                reproductor.play();
                pos_reproduccion = setInterval(function () {
                                       // get media position
                                       reproductor.getCurrentPosition(
                                           // success callback
                                           function (position) {
                                               if (position > -1) {
                                                    console.log((position) + " sec");
                                                    $("#slider-rep").closest(".ui-slider").find(".ui-slider-handle").text(position + "%");
                                                    console.log ("Reproductor por " + position);
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