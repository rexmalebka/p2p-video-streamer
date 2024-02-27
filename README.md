# P2P video streamer


p2p video streamer created with react and peerjs

## https

create certificates for https
> openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem

## host

works as a server endpoint, collects video streams, just scan the QR to get a client

## client

streams video from a cam source to an endpoint using webrtc calls, usually this is intended to be used by a phone

## configure

for specific peerjs configuration
