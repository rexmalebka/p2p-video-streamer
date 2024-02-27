import Peer, { MediaConnection } from 'peerjs'
import { useEffect, useReducer, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import type { peer_status } from './main'

const Stream = ({ peer, peer_status, change_configuration }: { peer: Peer, peer_status: peer_status, change_configuration: (host: string, port: number, path: string) => void }) => {
    const navigate = useNavigate()
    const { host_id } = useParams()
    const [searchParams, set_searchParams] = useSearchParams()

    const [stream, set_stream] = useState<MediaStream>()
    const video_ref = useRef<HTMLVideoElement>(null)


    // useEffect(() => {
    //     const host = searchParams.get('host') || ''
    //     const port = Number(searchParams.get('port')) || 443
    //     const path = searchParams.get('path') || ''

    //     change_configuration(host, port, path)
    // }, [searchParams])

    useEffect(() => {
        if (!host_id || !stream || !peer || peer_status != 'connected') return

        const call = peer.call(host_id, stream)

        return () => {
            call.close()
        }
    }, [host_id, stream, peer, peer_status])

    useEffect(() => {
        if(peer_status != 'connected') return

        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: (window.innerWidth <= 768) ? {
                facingMode: 'environment'
            } : true
        }).then((stream) => {
            set_stream(stream)
        })

    }, [peer_status])

    useEffect(() => {
        if (!video_ref.current || !stream) return

        video_ref.current.srcObject = stream
        video_ref.current.play()

        video_ref.current.style.width = '100%'
        video_ref.current.style.height = '100%'

    }, [video_ref, stream])

    return (
        <>
            <div>
                <button onClick={() => navigate('/')}>🛰️ stop streaming ({host_id})</button>
            </div>
            <div><video playsInline={true} muted controls={false} autoPlay={true} loop ref={video_ref}></video></div>
        </>
    )
}

export default Stream