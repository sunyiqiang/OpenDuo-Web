# Agora Open Duo (WEB)
Built upon the Agora Video SDK and the Agora Signaling SDK, the Agora WEB OpenDuo Sample App is an open-source demo that integrates video chat into your WEB applications.

This sample app allows you to:
* Login the signaling server
* Call each other
* Join the media channel
* Leave the media channel

The Agora Video SDK supports:
* iOS
* Android
* Web

You can also find demos for the following platforms:

- [OpenDuo-iOS-Objective-C](https://github.com/AgoraIO/OpenDuo-iOS-Objective-C)
- [OpenDuo-Android](https://github.com/AgoraIO/OpenDuo-Android)

## Running the App
1. Create a developer account at [Agora.io](https://dashboard.agora.io/signin/), obtain an App ID, and enable the App Certificate. 
2. Fill in the AppID and the App Certificate in the meeting.js:

          const appid = "YOUR_SIGNALING_APPID", appcert = "YOUR_SIGNALING_APP_CERTIFICATE";
      
3. Download and unzip the Video SDK and the signaling SDK at [Agora.io](https://www.agora.io/en/download/). 
4. Run npm in the root directory of your project to install dependency. 
   
          npm install
   
5. Use gulp to build the project.

         gulp build
   
A “dist” directory is generated under **/root** of your project.

NOTE: Deploy this project on the server and view the page using http/https. Do not double click the corresponding file to view the page. 

## About the SignalingToken

The SignalingToken is not used by default. When you login the signaling server, have the server work out the SignalingToken for authentication purposes. To use the SignalingToken, also rewrite the following login function in the signalingClient.js.

      //... 
      let session = this.signal.login(account,'_no_need_token');
      //... 

## About the Dynamic key

The dynamic key is not used by default. Use the video server to work it out for authentication purposes. Modify the getDynamicKey function in the rtc.js. 

* If Dynamic Key is not enabled:

        getDynamicKey(channelName){
        return new Deferred().resolve(undefined).promise();
        }
        
 * If Dynamic Key is enabled: 
 
        getDynamicKey(channelName){
          return $.ajax({
              url: 'service url to get your dynamic key'
          })
        }
        
## Contact Us
 
* You can find the full API documentation at the [Developer Center](https://docs.agora.io/en/).
* You can file a ticket about this demo at [issue](https://github.com/OpenDuo-Android/issues).

## License

The MIT License (MIT). 













