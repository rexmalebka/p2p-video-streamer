import * as ReactDOM from "react-dom"
import React , { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom'
import { useNavigate  } from "react-router-dom";

const index: React.FC = ()=> {
	const navigate = useNavigate()

	return (
		<>
			<div onClick={()=>{ navigate("/host")}} class="link">
				<h2>
					host
				</h2>
			</div>
			<div onClick={()=> navigate("/post")} class="link">
				<h2>
					stream
				</h2>
			</div>

		</>
	)
}

export default index
