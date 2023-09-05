import React from 'react'

interface Props {
	bgcolor: string;
	progress: number;
	height: number;
}

const ProgressBar = ({bgcolor,progress,height}: Props) => {
	
	const Parentdiv = {
		height: height,
		width: '100%',
		backgroundColor: 'whitesmoke',
		borderRadius: 40,
		margin: 50
	}
	
	const Childdiv = {
		height: '100%',
		width: `${progress}%`,
		backgroundColor: bgcolor,
		borderRadius:40,
	}
	
	const progresstext = {
		padding: 0,
		marginLeft: 5,
		color: 'black',
		fontWeight: 900,
		width: 33,
		display: 'flex',
	}
		
	return (
	<div style={Parentdiv}>
	<div style={Childdiv}>
		<span style={progresstext}>{`${progress}%`}</span>
	</div>
	</div>
	)
}

export default ProgressBar;
