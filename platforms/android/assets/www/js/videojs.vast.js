(function (vjs, vast) {
    "use strict";
    var
        extend = function (obj) {
            var arg, i, k;
            for (i = 1; i < arguments.length; i++) {
                arg = arguments[i];
                for (k in arg) {
                    if (arg.hasOwnProperty(k)) {
                        obj[k] = arg[k];
                    }
                }
            }
            return obj;
        },

        defaults = {
            skip: 5 // negative disables
        },

        vastPlugin = function (options) {

            var player = this;
            var settings = extend({}, defaults, options || {});
            var LoopCount = 1;
            var AdCount = 0;
            var TimeOutCounter = 0;

            if (player.ads === undefined) {
                console.log("VAST requires videojs-contrib-ads");
                return;
            }

            if (settings.AdCount === undefined || settings.AdCount < 0){
                console.log("AdCount does not exist, or is negative. Stopping VAST Ads");
                player.trigger('adtimeout');
            }

            // If we don't have a VAST url, just bail out.
            if (settings.api === undefined) {
                console.log("No vast tag URLs have been found.. Stopping VAST Ads");
                player.trigger('adtimeout');
                return;
            }

            function randomIntFromInterval(min,max) {
                return Math.floor(Math.random()*(max-min+1)+min);
            }

            function InitiateContentLoader(){
                //var Number = randomIntFromInterval(1, settings.api.length)-1;
                if(LoopCount <= settings.AdCount){
                    if(settings.api[AdCount] === undefined){
						player.off("contentupdate");
						changeSource(settings.intro);
						player.on("ended", function(){
							console.log("activated the last ended event");
							changeSource(settings.content);
						});
					}else{
						var ad = settings.api[AdCount]["url"];
						player.vast.getContent(ad);
                        console.log("Getting ad from index: "+AdCount);
					}
                }
            }

            player.on('contentupdate', function (){
                InitiateContentLoader();
            });

            player.on('readyforpreroll', function (){
                player.vast.preroll();
            });

            player.vast.getContent = function (url){

                    vast.client.get(url, function (response) {
                        if (response) {
                            for (var adIdx = 0; adIdx < response.ads.length; adIdx++) {
                                var ad = response.ads[adIdx];
                                player.vast.companion = undefined;
                                for (var creaIdx = 0; creaIdx < ad.creatives.length; creaIdx++) {
                                    var creative = ad.creatives[creaIdx], foundCreative = false, foundCompanion = false;
                                    if (creative.type === "linear" && !foundCreative) {

                                        if (creative.mediaFiles.length) {

                                            player.vast.sources = player.vast.createSourceObjects(creative.mediaFiles);

                                            console.log("Getting ads from: "+JSON.stringify(player.vast.sources));
                                            if (!player.vast.sources.length) {
                                                player.trigger('adtimeout');
                                                TimeOutCounter++;
                                                if(TimeOutCounter > 5){
                                                    AdCount++;
                                                    TimeOutCounter = 0;
                                                }
                                                console.log("URL timeout..");
                                                player.trigger("contentupdate");
                                                return;
                                            }
                                            player.play();
                                            player.vastTracker = new vast.tracker(ad, creative);

                                            var errorOccurred = false,
                                                canplayFn = function () {
                                                    this.vastTracker.load();
                                                },
                                                timeupdateFn = function () {
                                                    if (isNaN(this.vastTracker.assetDuration)) {
                                                        this.vastTracker.assetDuration = this.duration();
                                                    }
                                                    this.vastTracker.setProgress(this.currentTime());
                                                },
                                                playFn = function () {
                                                    this.vastTracker.setPaused(false);
                                                },
                                                pauseFn = function () {
                                                    this.vastTracker.setPaused(true);
                                                },
                                                errorFn = function () {
                                                    // Inform ad server we couldn't play the media file for this ad
                                                    vast.util.track(ad.errorURLTemplates, {ERRORCODE: 405});
                                                    errorOccurred = true;
                                                };

                                            player.on('canplay', canplayFn);
                                            player.on('timeupdate', timeupdateFn);
                                            player.on('play', playFn);
                                            player.on('pause', pauseFn);
                                            player.on('error', errorFn);

                                            player.one('ended', function () {
                                                player.off('canplay', canplayFn);
                                                player.off('timeupdate', timeupdateFn);
                                                player.off('play', playFn);
                                                player.off('pause', pauseFn);
                                                player.off('error', errorFn);
                                                if (!errorOccurred) {
                                                    this.vastTracker.complete();
                                                }
                                            });

                                            foundCreative = true;
                                        }

                                    } else if (creative.type === "companion" && !foundCompanion) {

                                        player.vast.companion = creative;

                                        foundCompanion = true;

                                    }
                                }

                                if (player.vastTracker) {
                                    player.trigger("adsready");
                                    break;
                                } else {
                                    // Inform ad server we can't find suitable media file for this ad
                                    vast.util.track(ad.errorURLTemplates, {ERRORCODE: 403});
                                    player.trigger("player.vastTracker returned false");
                                }
                            }
                        }else{
                            TimeOutCounter++;
                            console.log("Timeout: "+TimeOutCounter);
                            if(TimeOutCounter > 5){
                                AdCount++;
                                TimeOutCounter = 0;
                            }
                            player.trigger("contentupdate");
                            return;
                        }

                        if (!player.vastTracker) {
                            // No pre-roll, start video
                            TimeOutCounter++;
                            console.log("Timeout: "+TimeOutCounter);
                            //player.trigger('adtimeout');
                            if(TimeOutCounter > 5){
                                AdCount++;
                                TimeOutCounter = 0;
                            }
                            player.trigger("contentupdate");
                        }
                    });
            };

            player.vast.preroll = function () {

                player.ads.startLinearAdMode();

                player.autoplay(true);
                // play your linear ad content
                var adSources = player.vast.sources;
                player.src(adSources);

                var clickthrough;
                if (player.vastTracker.clickThroughURLTemplate) {
                    clickthrough = vast.util.resolveURLTemplates(
                        [player.vastTracker.clickThroughURLTemplate],
                        {
                            CACHEBUSTER: Math.round(Math.random() * 1.0e+10),
                            CONTENTPLAYHEAD: player.vastTracker.progressFormated()
                        }
                    )[0];
                }
                var blocker = document.createElement("a");
                blocker.className = "vast-blocker";
                blocker.href = clickthrough || "#";
                blocker.target = "_blank";
                blocker.onclick = function () {
                    var clicktrackers = player.vastTracker.clickTrackingURLTemplate;
                    if (clicktrackers) {
                        player.vastTracker.trackURLs([clicktrackers]);
                    }
                    player.trigger("adclick");
                    player.vast.blocker.parentNode.removeChild(player.vast.blocker);
                };
                player.vast.blocker = blocker;
                player.el().insertBefore(blocker, player.controlBar.el());

                var skipButton = document.createElement("div");
                skipButton.className = "vast-skip-button";
                if (settings.skip < 0) {
                    skipButton.style.display = "none";
                }
                player.vast.skipButton = skipButton;
                player.el().appendChild(skipButton);

                player.on("timeupdate", player.vast.timeupdate);

                skipButton.onclick = function (e) {
                    if ((' ' + player.vast.skipButton.className + ' ').indexOf(' enabled ') >= 0) {
                        player.vast.tearDown();
                    }
                    if (Event.prototype.stopPropagation !== undefined) {
                        e.stopPropagation();
                    } else {
                        return false;
                    }
                };
                player.one("ended", player.vast.tearDown);
            };

            player.vast.tearDown = function () {
                console.log("teardown started..");
                player.vast.skipButton.parentNode.removeChild(player.vast.skipButton);
                if(player.vast.blocker){
                    player.vast.blocker.parentNode.removeChild(player.vast.blocker);
                }
                player.off('timeupdate', player.vast.timeupdate);
                player.off('ended', player.vast.tearDown);
                player.ads.endLinearAdMode();
                console.log("TearDown successful..");
                if(LoopCount < settings.AdCount){
                    LoopCount++;
                    TimeOutCounter = 0;
                    console.log("Repeat ads");
                    player.trigger("contentupdate");
                }else{
                    console.log("Advertisement is done..");
                    LoopCount++;
                    player.off("contentupdate");
                    player.on("ended", function(){
                        console.log("activated the last ended event");
                        changeSource(settings.content);
                    });
                }
                console.log("woot");
                console.log("LoopCount: "+LoopCount+" AdCount: "+settings.AdCount);
            };



            function changeSource(src) {
                player.pause();
                player.currentTime(0);
                player.src(src);
                player.ready(function() {
                    this.one('loadeddata', videojs.bind(video, function() {
                        this.currentTime(0);
                    }));
                    this.load();
                    this.play();
                });
                video.off("ended");
            }

            player.vast.timeupdate = function (e) {
                player.loadingSpinner.el().style.display = "none";
                var timeLeft = Math.ceil(settings.skip - player.currentTime());
                if (timeLeft > 0) {
                    player.vast.skipButton.innerHTML = "Skip in " + timeLeft + "...";
                } else {
                    if ((' ' + player.vast.skipButton.className + ' ').indexOf(' enabled ') === -1) {
                        player.vast.skipButton.className += " enabled";
                        player.vast.skipButton.innerHTML = "Skip";
                    }
                }
            };
            player.vast.createSourceObjects = function (media_files) {
                var sourcesByFormat = {}, format, i;
                var vidFormats = ['video/mp4', 'video/webm', 'video/ogv'];
                // get a list of files with unique formats
                for (i = 0; i < media_files.length; i++) {
                    format = media_files[i].mimeType;

                    if (vidFormats.indexOf(format) >= 0) {
                        if(sourcesByFormat[format] === undefined) {
                            sourcesByFormat[format] = [];
                        }
                        sourcesByFormat[format].push({
                            type: format,
                            src: media_files[i].fileURL,
                            width: media_files[i].width,
                            height: media_files[i].height
                        });
                    }
                }

                // Create sources in preferred format order
                var sources = [];
                for (var j=0; j < vidFormats.length; j++) {
                    format = vidFormats[j];
                    if (sourcesByFormat[format] !== undefined) {
                        for (i = 0; i < sourcesByFormat[format].length; i++) {
                            sources.push(sourcesByFormat[format][i]);
                        }
                    }
                }
                return sources;
            };

        };

    vjs.plugin('vast', vastPlugin);
}(window.videojs, window.DMVAST));