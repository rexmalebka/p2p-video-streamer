import * as ReactDOM from "react-dom"
import { useEffect, useState, useRef, useCallback } from 'react'
import Peer, { MediaConnection, PeerErrorType } from 'peerjs'

//import Index from './index.tsx'

import './css/style.css'

import { HashRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import Host from './host'
import Stream from "./stream";
import Configure from "./configure";

export type fatal_errors = (
    'browser-incompatible' |
    "invalid-id" |
    "invalid-key" |
    "ssl-unavailable" |
    "server-error" |
    "socket-error" |
    "socket-closed"
)

export type non_fatal_errors = (
    "disconnected" |
    "network" |
    "unavailable-id" |
    "webrtc"
)

export type peer_status = (
    fatal_errors | non_fatal_errors |
    "connecting" | "connected"
)

const Home = ({ peer, peer_status }: { peer: Peer | undefined, peer_status: peer_status }) => {
    const navigate = useNavigate()

    return (
        <div>
            {
                peer ? (
                    <>
                        <div><button disabled={peer_status != 'connected'} onClick={() => navigate('/host')}>📡 host</button></div>
                        <div><button disabled={peer_status != 'connected'} onClick={() => navigate('/stream/sdf')}>🛰️ stream</button></div>
                        <div><button onClick={() => navigate('/configure')}>⚙️ configure</button></div>
                    </>
                ) : null
            }
        </div>
    )
}


const Router = () => {
    const [peer, set_peer] = useState<Peer>()
    const [peer_id, set_peer_id] = useState('')
    const [peer_status, set_peer_status] = useState<peer_status>('connecting')

    useEffect(() => {
        const p = new Peer()

        set_peer(p)
        add_listeners(p)

        console.debug(p)

    }, [])

    const add_listeners = useCallback((peer: Peer) => {

        peer.on('open', (id) => {
            set_peer_id(id)
            set_peer_status('connected')
        })

        peer.on('close', () => {
            set_peer_status('disconnected')
        })

        peer.on('error', (err) => {
            set_peer_status(err.type)

            if (err.type as PeerErrorType == 'peer-unavailable') {
                console.info("unavailable", err.message)
                const id = err.message.split(' ').slice(-1)[0]
                return
            }

            if (['server-error', 'socket-error', 'socket-closed'].includes(err.type)) {
                console.error(err)
                setTimeout(() => {
                    window.location.reload()
                }, 3000)
            }
        })
    }, [])

    const change_configuration = useCallback((host: string, port: number, path: string) => {
        if (!peer) return

        if(
            peer.options.host == host && 
            peer.options.port == port && 
            peer.options.path == path 
            ) return
            
        peer.destroy()
        set_peer(undefined)
        const p = new Peer(
            {
                host: host,
                port: port,
                path: path

            })

        set_peer(p)
        add_listeners(p)
        console.debug(p, 'peer')

    }, [peer])


    return (
        <>
            <div>
                <div><h1>p2p Video streamer</h1></div>
                {
                    peer ? (
                        <HashRouter>
                            <Routes>
                                <Route path='/' element={<Home peer={peer} peer_status={peer_status} />}></Route>
                                <Route path='/host' element={
                                    <Host peer={peer} peer_id={peer_id} peer_status={peer_status} />
                                }></Route>
                                <Route path='/configure' element={
                                    <Configure peer={peer} change_configuration={change_configuration} />
                                }></Route>
                                <Route path='/stream/:host_id' element={<Stream peer={peer} peer_status={peer_status} change_configuration={change_configuration}/>}></Route>
                                <Route path='*' element={<Navigate to='/' />}></Route>
                            </Routes>
                        </HashRouter>
                    )
                        : null
                }
                <div>{peer_status}</div>
            </div >

        </>
    )
}

ReactDOM.render(<Router></Router>, document.querySelector("#app"))
