import * as ReactDOM from "react-dom"
import React , { useEffect, useState, useRef } from 'react';

import Header from './components/header.tsx'

import Menu from './menu.tsx'
import Host from './host.tsx'
import Stream from './stream.tsx'

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Peer from 'peerjs'

import './css/index.css'

const index = ()=>{
	const [p, set_peer] = useState(null)
	const [streams,set_streams] = useState([])

	const current_stream = useRef(0)
	const ctx = useRef()
	const canvas = useRef( <canvas class="output" ref={(node)=>{
		if(node){
			node.width = window.innerWidth
			node.height = window.innerHeight
			ctx.current = node.getContext("2d")

			window.addEventListener('resize',()=>{
				node.width = window.innerWidth
				node.height = window.innerHeight
				ctx.current = node.getContext("2d")
			})
		}
	}}>
	</canvas>)

	useEffect(()=>{
		const peer = new Peer()

		peer.on('open', ()=>{

			set_peer(peer)
			setInterval(function(){
				set_streams(s =>{
					if(s.length > 0){
						current_stream.current = (current_stream.current +1) % s.length
					}
					return s
				})
			}, 2000)
		})
		peer.on('error', (err)=> set_peer(null))
		peer.on('disconnected', ()=> set_peer(null))
		peer.on('close', ()=> set_peer(null))

		peer.on('call', function(call){
			console.debug("receiving call", call)

			call.on('stream', function(stream){
				const rid = setInterval(function(){
					if(call.peerConnection.connectionState == 'failed'){
						clearInterval(rid)
						set_streams(s=>{
							current_stream.current = (current_stream.current + 1) % s.length

							return s
						})
						call.close()
						//streams.current = streams.current.filter( x=> x.id != call.peer )
						set_streams( s=>{
							return s.filter( x=> x.id != call.peer )
						})
					}
				}, 500)

				const s = {
					id: call.peer,
					rid: rid,
					stream: stream,
					metadata: call.metadata
				}

				set_streams(ss=> [...ss, s])

				//streams.current = [...streams.current, s]
			})


			call.on('close', function(){
				console.debug("connection closed")

				set_streams(s=>{
					return s.filter( x=> {
						if(x.id == call.peer){
							current_stream.current = (current_stream.current + 1) % s.length
							clearInterval(x.rid)
						}
						return x.id != call.peer
					})
				})
				/*
				streams.current = streams.current.filter( x=> {
					if(x.id == call.peer){
						current_stream.current = (current_stream.current + 1) % streams.current.length
						clearInterval(x.rid)
					}
					return x.id != call.peer
				})
				 */

			})

			call.on('error', function(){
				console.debug("connection error")

				set_streams(s=>{
					return s.filter( x=> {
						if(x.id == call.peer){
							current_stream.current = (current_stream.current + 1) % slength
							clearInterval(x.rid)
						}
						return x.id != call.peer
					})
				})

				/*
				streams.current = streams.current.filter( x=> {
					if(x.id == call.peer){
						current_stream.current = (current_stream.current + 1) % streams.current.length
						clearInterval(x.rid)
					}
					return x.id != call.peer
				})
				 */
			})

			call.answer()

		})

		console.debug("peer",peer)
	},[])

	return (
		<HashRouter>
			<Routes>
				<Route path="/" 
					element={
						<Header canvas={canvas}>
							<Menu />
						</Header>
					}
				/>
				<Route
					path="/host"
					element={
						<Header canvas={canvas}>
							<Host
								peer={p}
								ctx={ctx}
								streams={streams}
								current_stream={current_stream}
							/>

					</Header>
					}
				/>
				<Route
					path="/stream/:host"
					element={
						<Header	canvas={canvas}>
							<Stream 
								ctx={ctx}
								canvas={canvas}
								peer={p}
							/>
						</Header>
					}
				/>
				<Route
					path="*"
					element={<Menu />}
				/>

		</Routes>
	</HashRouter>
)}

export default index
