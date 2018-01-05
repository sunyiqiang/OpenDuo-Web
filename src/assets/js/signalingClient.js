class SignalingClient{
    constructor(appid, appcertificate){
        this.signal = Signal(appid);
        this.call_holding = null;
        this.call_active = null;
        this.channel = null;
        this.appid = appid;
        this.appcert = appcertificate;
        this.uid = null;

        this.onInviteReceived = null;
        this.onInviteEndByPeer = null;
    }

    login(account){
        let deferred = $.Deferred();
        let appid = this.appid;
        let appcert = this.appcert;
        Logger.log('Logging in ' + account);
        //starts login
        let session = this.signal.login(account, appcert ? SignalingToken.get(appid, appcert, account, 1):"");
        
        //if success
        session.onLoginSuccess = $.proxy(uid => {
            Logger.log('login success ' + uid);
            this.uid = uid;
            deferred.resolve();
        }, this);

        //if fail
        session.onLoginFailed = $.proxy(ecode => {
            Logger.log('login failed ' + ecode);
            this.session = null
            deferred.reject();
        }, this);

        session.onInviteReceived = $.proxy(this._onInviteReceived, this);
        this.session = session;

        return deferred.promise();
    }

    call(channelName, peer, require_peer_online){
        let deferred = $.Deferred();
        let extra = {};

        if(require_peer_online){
            extra["_require_peer_online"] = 1;
        }

        let extra_msg = JSON.stringify(extra);

        Logger.log('call ' + peer + ' , channelName : ' + channelName + ', extra : ' + extra_msg);

        let call = this.session.channelInviteUser2 ( channelName, peer, extra_msg);

        call.onInviteAcceptedByPeer = $.proxy(extra => {
            this.call_active = this.call_holding;
            this.call_holding = null;
            this.join(call.channelName).then(_ => {
                Logger.log('call.onInviteAcceptedByPeer ' + extra);
                deferred.resolve();
            });
        }, this);

        call.onInviteRefusedByPeer = $.proxy(extra => {
            Logger.log(`call.onInviteRefusedByPeer ${extra}`);
            let status = JSON.parse(extra).status;
            deferred.reject({reason: `Call refused. ${this.statusText(status)}`});
        }, this);
        
        call.onInviteFailed = $.proxy(extra => {
            Logger.log(`call.onInviteFailed ${extra}`);
            deferred.reject({reason: `Invite failed: ${JSON.parse(extra).reason}`});
        }, this);

        call.onInviteEndByPeer = $.proxy(this._onInviteEndByPeer, this);

        this.call_holding = call;

        return deferred.promise();
    }

    join(channelName){
        let deferred = $.Deferred()
        Logger.log(`Joining channel ${channelName}`);

        let channel = this.session.channelJoin(channelName);
        channel.onChannelJoined = _ => {
            Logger.log('channel.onChannelJoined');
            deferred.resolve();
        };
        
        channel.onChannelJoinFailed = ecode => {
            Logger.log(`channel.onChannelJoinFailed ${ecode}`);
            deferred.reject(ecode);
        };

        this.channel = channel;

        return deferred.promise();
    }

    leave(){
        let deferred = $.Deferred();
        let channel = this.channel;

        if(channel === null){
            return deferred.resolve().promise();
        }

        channel.onChannelLeaved = $.proxy(ecode => {
            Logger.log('channel.onChannelLeaved');
            this.channel = null;
            deferred.resolve();
        }, this);
        channel.channelLeave();
        return deferred;
    }

    acceptCall(call){
        let deferred = $.Deferred();
        this.call_active = this.call_holding;
        this.call_holding = null;

        this.join(call.channelName).done(_ => {
            call.channelInviteAccept();
            deferred.resolve({
                peer: call.peer,
                channelName: call.channelName
            });
        }).catch(err => {
            deferred.reject(err);
        });

        return deferred.promise();
    }

    rejectCall(call, status){
        let deferred = $.Deferred();
        status = status || 0;
        call.channelInviteRefuse(JSON.stringify({status: status}));
        return deferred.resolve().promise();
    }

    endCall(call, passive){
        let deferred = $.Deferred();
        let channel = this.channel;
        
        call.onInviteEndByMyself = $.proxy(extra => {
            Logger.log('call.onInviteEndByMyself ' + extra);
            this.call_holding = (this.call_holding === call) ? null : this.call_holding;
            this.call_active = (this.call_active === call) ? null : this.call_active;
            this.leave();
        }, this);

        if(!passive){
            call.channelInviteEnd();
        } else {
            this.call_active = null;
            this.call_holding = null;
        }
        return deferred.promise();
    }

    statusText(status){
        switch(status){
            case 0:
            return "Peer rejected.";
            case 1:
            return "Peer is busy.";
        }
    }

    //session events delegate
    _onInviteReceived(call){
        Logger.log(`recv invite from ${call.peer}, ${call.channelName}, ${call.extra}`);

        //incoming call for accept or refuse
        if(this.call_active !== null){
            //busy
            this.rejectCall(call, 1);
        } else {
            call.onInviteEndByPeer = $.proxy(this._onInviteEndByPeer, this);
            this.call_holding = call;
            if(this.onInviteReceived !== null){
                this.onInviteReceived(call);
            }
        }
    }

    //call events delegate
    _onInviteEndByPeer(extra){
        Logger.log('call.onInviteEndByPeer ' + extra);
        if(this.onInviteEndByPeer !== null){
            this.onInviteEndByPeer();
        }
    }
}