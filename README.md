# P2P video streamer


p2p video streamer created with react and peerjs

![image](https://github.com/rexmalebka/p2p-video-streamer/assets/17996715/ce50abe1-00d8-4add-bef2-6eef51951b76)


## https

create certificates for https, for camera access this is necessary sometimes.

> openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem

## host

works as a video endpoint, collects video streams, just scan the QR to get a client, if a new client is connected, video will be replaced

![image](https://github.com/rexmalebka/p2p-video-streamer/assets/17996715/4a9ac3eb-4c74-4b2e-a6db-ccdb679e7995)


## stream

streams video from a cam source to an endpoint using webrtc calls, usually this is intended to be used by a phone

![image](https://github.com/rexmalebka/p2p-video-streamer/assets/17996715/5604033f-f499-416a-bcd8-9d98b9bf8ed7)


## configure

for custom peerjs configuration, this section is still in progress
