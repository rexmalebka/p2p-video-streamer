import * as ReactDOM from "react-dom"
const QRCode = require('qrcode')
import React , { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'


const host: React.FC = ({peer, ctx, streams, current_stream})=> {
	const navigate = useNavigate()

	// qr stuff
	const [qr_vis, set_qr_vis] = useState(false)
	const [qr_url, set_qr_url] = useState('')
	const qr_ref = useRef()

	// log
	const [logs, set_logs] = useState('')

	// output ctx
	const ctx_ref = useRef()
	
	// ref for animation frame
	const animate_ref = useRef()

	// ref for videos
	const videos_ref = useRef({})


	useEffect(()=> set_logs("creating host.") ,[])


	useEffect(()=>{
		if(qr_ref.current && peer && peer.id && !qr_url){
			//const url = `${}/#/stream/${peer.id}`
			const url=`${location.protocol}//${location.host}${location.pathname}/#/stream/${peer.id}`
			set_qr_url(url)
			QRCode.toCanvas(qr_ref.current, url)
			set_logs(`host with id: ${peer.id}.`)
		}
	})

	const animate = useCallback((time)=>{

		const cs = current_stream.current
		const output_ctx = ctx.current
		const stream = videos_ref.current[cs]

		//console.debug("ctx", ctx, cs, stream)
		if(output_ctx && stream){
			const res = stream.metadata.res

			output_ctx.clearRect(0,0, res[0], res[1]);
			output_ctx.drawImage(stream.video, 0, 0, res[0], res[1])
		}
	},[ctx, streams, current_stream])

		/*useEffect(()=>{
		console.debug("streams uwu")
	},[streams])
		 */
	useEffect(()=>{
		//animate_ref.current = requestAnimationFrame(animate)
		animate_ref.current = setInterval(animate, 10)
		return ()=>{
			clearInterval(animate_ref.current)
		}
	}, [streams, ctx_ref])


	return (
		<>
			<div onClick={ ()=> set_qr_vis(!qr_vis) } class="link">
				<h2>{qr_vis ? 'hide qr' : 'show qr'}</h2>
			</div>
			<div className={ qr_vis ? 'link' : 'link hidden'}>
				<a href={qr_url}>
					<canvas id="qr" ref={qr_ref}></canvas>
				</a>
			</div>
			<div>
				<h3>{streams.length} sources</h3>
			</div>
			<div>
				<pre>{logs}</pre>
			</div>
			<div class="hidden">{ streams.map( (stream,i) => {
				return (
					<video ref={ (vid)=>{
						if(vid){
							videos_ref.current[i] = {
								...stream,
								video:vid
							}
							vid.srcObject = stream.stream
							vid.play()
							vid.width = stream.metadata.res[0]
							vid.height = stream.metadata.res[1]
						}
					}
						}>
					</video>)
				}) }
			</div>


		</>
	)
}

export default host
