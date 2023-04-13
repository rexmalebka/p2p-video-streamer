import React, {useState} from 'react'

const header: React.FC = ({children, canvas})=>{
	const [vis, set_vis] = useState(true)

	return (

	<div className={vis ? "panel" : 'panel_hidden'} >
		<div class="link" onClick={()=> set_vis( v => !v)}>
			<h1><i>p2p video streamer</i></h1>
		</div>
		<div>
			{canvas.current}
		</div>
		<div className={vis ? 'opts' : 'hidden'}>
		{children}
		</div>

	</div>

)
} 

export default header
