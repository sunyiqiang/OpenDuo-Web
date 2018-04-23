# Agora Open Duo (Web)

*其他语言版本： [简体中文](README.zh.md)*

The Agora OpenDuo Sample App supports the following platforms:
* [iOS](https://github.com/AgoraIO/OpenDuo-iOS-Objective-C)
* [Android](https://github.com/AgoraIO/OpenDuo-Android)
* Web

This readme describes steps and several considerations for demonstrating the Agora Web OpenDuo Sample App.

## A Brief Introduction

Built upon the Agora Video SDK and the Agora Signaling SDK, the Agora Web OpenDuo Sample App is an open-source demo that integrates video chat into your Web applications.

This sample App allows you to:
* Login the signaling server
* Call each other
* Join the media channel
* Leave the media channel

## Preparing the Developer Environment

1. Ensure that your device has a camera and sufficient CPU and memory, and make sure that your device meets one of the following requirements:

  * macOS
  * Windows 7 or later
  * iOS 11 or later
  * Android 4.1 or later
 
 2. Ensure that your device has one of the following browsers:
 
  - Chrome 58 or later
  - Firefox 56 or later
  - Opera 45 or later
  - Safari 11 or later
  - QQ browser

## Running the App
1. Create a developer account at [Agora.io](https://dashboard.agora.io/signin/), obtain an App ID, and enable the App Certificate. 
2. Fill in the AppID and the App Certificate in the meeting.js:

          const appid = "YOUR_SIGNALING_APPID", appcert = "YOUR_SIGNALING_APP_CERTIFICATE";
      
3. Download the Video SDK and the signaling SDK from [Agora.io](https://www.agora.io/en/download/). 
4. Unzip the downloaded SDKs. 
4. Run npm in the root directory of your project to install dependency. 
   
          npm install
   
5. Use gulp to build the project.

         gulp build
   
*A “dist” directory is generated under **/root** of your project.*

NOTE: Deploy this project on the server and view the page using http/https. Do not double click the corresponding file to view the page. 

## About the SignalingToken

The SignalingToken is not used by default. When you login the signaling server, have the server work out the SignalingToken for authentication purposes. To use the SignalingToken, also rewrite the following login function in the signalingClient.js.

      //... 
      let session = this.signal.login(account,'_no_need_token');
      //... 

## About the Dynamic Key

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
* You can file a ticket about this demo at [issue](https://github.com/OpenDuo-Web/issues).

## License

The MIT License (MIT). 













