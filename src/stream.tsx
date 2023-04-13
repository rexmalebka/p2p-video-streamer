import React, { useEffect, useCallback, useState, useRef } from 'react';
const QRCode = require('qrcode')
import Peer from 'peerjs'
import { useParams } from 'react-router-dom';

window.React = React 

const Stream: React.FC = ({peer, ctx}) => {
	const {host} = useParams()

	const [conn, set_conn] = useState()

	const [logs, set_logs] = useState('')

	const [interacted, set_interacted] = useState(false)

	const output = useRef()

	const [stream, set_stream] = useState(null)

	const [devices, set_devices] = useState([])	
	const [selected, set_selected] = useState({deviceId:null})

	const animate_ref = useRef()

	const animate = useCallback((time)=>{
		// animate function to render video into canvas in case video changes src abruptly
		const output_ctx = ctx.current

		const video = output.current
		const width = video.videoWidth
		const height = video.videoHeight

		output_ctx.clearRect(0,0, width, height)
		output_ctx.drawImage(video, 0,0, width, height)
	},[ctx, output])

	useEffect(()=>{

		if(ctx.current && output.current){
			console.debug("ctx && output", output)

			animate_ref.current = setInterval(animate,10)
			set_stream( ctx.current.canvas.captureStream());
		}
		return ()=>{
			clearInterval(animate_ref.current)

		}
	}, [ctx, output])

	useEffect(()=>{
		if(!output.current){ return }

		// in case of change, update devices
		navigator.mediaDevices.ondevicechange = function(dev){
			navigator.mediaDevices.enumerateDevices({video:true}).then((devs) => {

				set_devices(old_devs => {
					const new_devices = devs.filter(device => device.kind == 'videoinput')
					return new_devices
				})
			})
		}

		navigator.mediaDevices.getUserMedia({
			video:{
				width: {
					ideal: window.screen.width
				},
				height: {
					ideal: window.screen.height
				}
				}
		}).then((stream)=>{
			//stream.getTracks().forEach(track => track.stop());

			console.debug("stream [output]", stream)
			output.current.srcObject = stream
			output.current.play()

			navigator.mediaDevices.enumerateDevices().then((devs) => {
				set_devices(old_devs => {
					const new_devices = devs.filter(device => device.kind == 'videoinput')
					console.debug("new devs", new_devices)
					if(new_devices.length > 0 ){
						set_selected(new_devices[0])
					}
					return new_devices
				})
			})

		})

	},[output])


	const toggle_stream = useCallback(()=>{
		if(!peer || !output.current || !selected.deviceId || !stream) return

		if(conn){
			conn.close()
			output.current.pause()
			set_conn(null)
			set_logs("streaming stopped")
			console.debug("stoppipng connection")
		}else{

			console.debug("interacted waiting to load")

			const video = output.current
			const width = video.videoWidth
			const height = video.videoHeight

			const c = peer.call(host, stream,{
				metadata:{
					id: peer.id,
					res: [width, height]
				}
			}) 


			set_conn(c)

			set_logs(`streaming to ${host}`)
		}
	})

	return (
		<>
			<div>
				<video class="output" ref={output} muted loop  ></video>
			</div>
			<div>
				{
					devices.length > 0 ? 

					<select id="devices" name="" disabled={conn != null}>
						{devices.map(d => <option selected={d.deviceId == selected.deviceId} value={d.label}>{d.label} </option> )}
					</select>
					: <h3>no sources detected</h3>
				}
			</div>
			<div class="link" onClick={toggle_stream}>
				<h2>
					{ (peer && stream) ?  ( conn ? 'stop' : 'stream' )   : 'connecting' }
				</h2>
			</div>
			<div>
				<pre>{logs}</pre>
			</div>
		</>
	)
};

export default Stream;
