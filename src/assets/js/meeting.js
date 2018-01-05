(function($) {
    $(() => {
        class Client{
            //construct a meeting client with signal client and rtc client
            constructor(sclient, rclient, localAccount){
                this.signal = sclient;
                this.rtc = rclient;
                this.localAccount = localAccount;

                //ring tones resources
                this.sound_ring = new Howl({
                    src: ['./assets/sound/basic_ring.mp3'],
                    loop: true
                });

                this.sound_tones = new Howl({
                    src: ['./assets/sound/basic_tones.mp3'],
                    loop: true
                });

                this.signal.onInviteReceived = $.proxy(this.onInviteReceived, this);
                this.signal.onInviteEndByPeer = $.proxy(this.onInviteEndByPeer, this);

                this.subscribeEvents();
            }

            //return a promise resolves a remote account name
            requestRemoteAccount(){
                let deferred = $.Deferred();
                let dialog = $(".remoteAccountModal");
                let accountField = dialog.find(".remoteAccountField");
                let localAccount = this.localAccount;
                
                dialog.find(".callBtn").off("click").on("click", (e) => {
                    //dialog confirm
                    let account = $(".remoteAccountField").val();

                    if (!account) {
                        $(".remoteAccountField").siblings(".invalid-feedback").html("Valid account should be a non-empty numeric value.")
                        $(".remoteAccountField").removeClass("is-invalid").addClass("is-invalid");
                    } else if(`${account}` === `${localAccount}`) {
                        $(".remoteAccountField").siblings(".invalid-feedback").html("You can't call yourself.")
                        $(".remoteAccountField").removeClass("is-invalid").addClass("is-invalid");
                    } else {
                        $(".startCallBtn").hide();
                        dialog.modal('hide');
                        deferred.resolve(account);
                    }
                });

                //start modal
                dialog.modal({backdrop: "static", focus: true});

                return deferred;
            }

            //return a promise resolves a signaling call result
            call(channelName, account, requirePeerOnline){
                let deferred = $.Deferred();
                let dialog = $(".callingModal");
                dialog.find(".callee").html(account);
                let signal = this.signal;

                signal.call(channelName, account, requirePeerOnline).done(_ => {
                    dialog.modal('hide');
                    deferred.resolve();
                }).catch($.proxy(err => {
                    Message.show(err.reason);
                    deferred.reject();
                }, this));

                return deferred.promise();
            }

            //end given call object, passive means the call is ended by peer
            endCall(call, passive){
                let deferred = $.Deferred();
                let signal = this.signal;
                let rtc = this.rtc;
                let btn = $(".toolbar .muteBtn");

                $(".startCallBtn").show();

                rtc.muted = true;
                btn.removeClass("btn-info").addClass("btn-secondary");
                btn.find("i").html("mic");

                //end rtc
                rtc.end();
                //end signal call
                signal.endCall(call, passive);
                return deferred.promise();
            }

            //ring when calling someone else
            ringCalling(play){
                if(play){
                    this.sound_ring.play();
                } else {
                    this.sound_ring.stop();
                }
            }
            //ring when being called by someone else
            ringCalled(play){
                if(play){
                    this.sound_tones.play();
                } else {
                    this.sound_tones.stop();
                }
            }

            //events
            subscribeEvents(){
                let signal = this.signal;
                //toolbar end call btn
                $(".toolbar .endCallBtn").off("click").on("click", $.proxy(e => {
                    this.ringCalling(false);
                    this.endCall(signal.call_active || signal.call_holding, false);
                }, this));

                //toolbar mute btn
                $(".toolbar .muteBtn").off("click").on("click", $.proxy(e => {
                    let btn = $(e.currentTarget);
                    let rtc = this.rtc;
                    rtc.toggleMute();
                    if(rtc.muted){
                        btn.removeClass("btn-secondary").addClass("btn-info");
                        btn.find("i").html("mic_off");
                    } else {
                        btn.removeClass("btn-info").addClass("btn-secondary");
                        btn.find("i").html("mic");
                    }
                }, this));

                $(".startCallBtn").off("click").on("click", $.proxy(e => {
                    this.requestRemoteAccount().done($.proxy(remoteAccount => {
                        //start calling via signal
                        if(remoteAccount !== ""){
                            this.ringCalling(true);
                            $.when(rtc.init(channelName, false), this.call(channelName, remoteAccount, true)).done($.proxy((stream, _) => {
                                this.ringCalling(false);
                                this.rtc.rtc.publish(stream);
                            }, this)).catch($.proxy(_ => {
                                this.ringCalling(false);
                                this.endCall(signal.call_active || signal.call_holding, false);
                            }, this));
                        }
                    }, this));
                }, this));
            }

            //delegate callback when receiving call
            onInviteReceived(call){
                let dialog = $(".calledModal");
                let signal = this.signal;
                let rtc = this.rtc;

                dialog.find(".caller").html(call.peer);
                dialog.find(".declineBtn").off("click").on("click", (e) => {
                    dialog.modal('hide');
                    this.ringCalled(false);
                    signal.rejectCall(call, 0);
                });

                dialog.find(".acceptBtn").off("click").on("click", (e) => {
                    dialog.modal('hide');
                    $(".startCallBtn").hide();
                    this.ringCalled(false);
                    signal.acceptCall(call).done(call => {
                        rtc.init(call.channelName, true);
                    }).catch(err => {
                        Logger.log(`Accept call failed: ${err}`);
                    });
                });

                this.ringCalled(true);
                dialog.modal({backdrop: "static"});
            }

            //delegate callback called when call end by peer
            onInviteEndByPeer(){
                let signal = this.signal;
                $(".calledModal").modal('hide');
                this.ringCalled(false);
                this.endCall(signal.call_active || signal.call_holding ,true);
            }
        }

        const appid = "YOUR_SIGNALING_APPID";
        let localAccount = Browser.getParameterByName("account");
        let signal = new SignalingClient(appid);
        let rtc = new RtcClient(appid);
        let client = new Client(signal, rtc, localAccount);
        let channelName = Math.random() * 10000 + "";
        //by default call btn is disabled
        signal.login(localAccount).done(_ => {
            //once logged in, enable the call btn
            $(".startCallBtn").prop("disabled", false);
        });
    });
}(jQuery));