import { useNavigate } from 'react-router-dom'
import Peer, { MediaConnection } from 'peerjs'
import { useEffect, useCallback, useState, useRef } from 'react'
import * as QRCode from 'qrcode'
import type { peer_status } from './main'

const Host = ({ peer, peer_id, peer_status }: { peer: Peer, peer_id: string, peer_status: peer_status }) => {
	const navigate = useNavigate()

	const qr_canvas = useRef<HTMLCanvasElement>(null)

	const [stream, set_stream] = useState<MediaStream>()

	const video_ref = useRef<HTMLVideoElement>(null)


	useEffect(() => {
		if (!qr_canvas.current || !peer_id || !peer) return

		const url = new URL(`${location.protocol}//${location.host}${location.pathname}/#/stream/${peer_id}`)

		url.searchParams.append('host', peer.options.host || '')
		url.searchParams.append('port', `${peer.options.port}`)
		url.searchParams.append('path', peer.options.path || '')
		
		const canvas = qr_canvas.current

		QRCode.toCanvas(canvas, url.href)

	}, [qr_canvas, peer_id, peer])

	const listen_calls = useCallback((call: MediaConnection) => {

		console.debug("caall", call)

		call.on('stream', (stream: MediaStream) => {
			set_stream(stream)
		})

		call.answer()
	}, [])


	useEffect(() => {
		if (!peer || peer_status != 'connected') return

		peer.addListener('call', listen_calls)

		return () => {
			peer.removeListener('call', listen_calls)
		}
	}, [peer, peer_status])

	useEffect(() => {
		if (!video_ref.current || !stream) return

		video_ref.current.srcObject = stream
		video_ref.current.play()

		video_ref.current.style.width = '100%'
		video_ref.current.style.height = '100%'
	}, [video_ref, stream])

	return (
		<>
			<div><canvas ref={qr_canvas}></canvas></div>
			<div><button onClick={() => navigate('/')}>📡 stop Hosting</button></div>
			<div><video playsInline={true} muted controls autoPlay={true} loop ref={video_ref}></video></div>
		</>
	)
}

export default Host