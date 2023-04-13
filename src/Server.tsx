import React, { useEffect, useState, useRef } from 'react';
const QRCode = require('qrcode')
import Peer from 'peerjs'

window.React = React 

function peer_onopen(peer, setConnected, output_qr){
	setConnected(true)

	console.debug("peer", peer)
	const url = `${window.location.href}/#/view/${peer.id}`
	QRCode.toCanvas(output_qr, url)
	console.debug(url)
}

function peer_onclose(setConnected){
	setConnected(false)
}


function peer_onconnection(peer,conn, streams, setStreams){
	console.debug(`user ${conn} connected`)

	peer.connect(conn.peer)

	conn.on('close', function(){
		console.debug("user disconnected", conn, streams, setStreams)
	})

	conn.on('data', function(data){
		console.log(data);
	});
}

function peer_oncall(call, streams, setStreams){
	console.debug("call received")
	
	call.on('stream', function(stream){
		console.debug("stream received")
		const video = document.createElement('video')
		video.srcObject = stream

		setStreams({
			...streams, ...{[call.peer]: video}
		})
		video.play()
		console.debug(stream, 'stream')
	})

	call.on('close', function(){
		console.debug("closed call", call.peer)
		const newStreams = Object.fromEntries(
			Object.entries(streams).filter(x=> x[0] != call.peer)
		)
		setStreams(newStreams)
	})

	call.on('error', function(){
		console.debug("closed call", call.peer)
		const newStreams = Object.fromEntries(
			Object.entries(streams).filter(x=> x[0] != call.peer)
		)
		setStreams(newStreams)
	})

	call.answer()
}


function toggle_qr(output_qr){
	if(!output_qr.current){
		return
	}

	if(output_qr.current.classList.contains('qr-hidden')){
		output_qr.current.classList.remove('qr-hidden')
	}else{
		output_qr.current.classList.add('qr-hidden')
	}

}


function change_interval(interval_ref){
	console.debug("miau", interval_ref.value)
}


const Server: React.FC = () => {
	const output = useRef()
	const [ctx, setCtx] = useState(null)

	const [connected, setConnected] = useState(false)

	const [qr, setQr] = useState()
	const output_qr = useRef()

	const [peer, setPeer] = useState()

	const [streams, setStreams] = useState({})

	let index=0

	const [loop, setLoop] = useState(
		setInterval(function(){

			if(!output.current || Object.keys(streams).length == 0){
				return
			}

			console.debug(index)
			index += 1
		}, 1000)
	)

	function drawVideo(){
		ctx.clearRect(0,0,2000,2000);
		if(output.current){
			const keys = Object.keys(streams)
			if(keys.length != 0 ){
				const next = streams[keys[index % keys.length]]
				ctx.drawImage(next, 0, 0)
			}

		}

		requestAnimationFrame(drawVideo)
	}

	requestAnimationFrame(drawVideo)

	

	useEffect(function(){
		
		console.debug("(miau")
		if(output.current){
			output.current.width = window.innerWidth
			output.current.height = window.innerHeight


			setCtx(
				output.current.getContext("2d")
			)

			window.addEventListener("resize",function(){
				output.current.width = window.innerWidth
				output.current.height = window.innerHeight
			},false);
		}
		

		if(output.current && output_qr.current ){
			const p = new Peer()
			setPeer(p)

			p.on('open', ()=> peer_onopen(p, setConnected, output_qr.current))

			p.on('close', ()=> peer_onclose(setConnected))

			p.on('error', function(){
				setConnected(false)
			})

			p.on('connection', (conn)=> peer_onconnection(p, conn, streams, setStreams))

			p.on('call', (call)=> peer_oncall(call, streams, setStreams, output.current))
		}

	}, [output, output_qr])




	return (
		<>
			<div id="output">
				<canvas
					autoplay loop muted
					ref={output}
				></canvas>
				<div class="opts">
					<div>
						<label onClick={() => toggle_qr(output_qr) }>QR</label>

					</div>
					<div>
						<canvas ref={output_qr}></canvas>
					</div>
					<div>
						<label >interval</label>
						<input type="range" onChange={(interval_ref)=> change_interval(interval_ref)} min="200" max="10000" value="1000"/>
					</div>
				</div>
			</div>

		</>
	)
};

export default Server;
