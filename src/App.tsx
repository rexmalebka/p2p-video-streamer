import React, { useEffect, useState, useRef } from 'react';
window.React = React 

const App: React.FC = () => {
	
	console.debug("miau")
	const output_canvas = useRef()

	return (
		<>
			<div id="output">
				<canvas
					ref={output_canvas}
				></canvas>
			</div>

		</>
	)
};

export default App;
