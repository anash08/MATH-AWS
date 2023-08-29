// myApp.js
class MyApp extends React.Component {
	constructor(props)
	{
		super(props);
		this.state = {
			composerPredefinedSetting: 'molOnly',	          
			chemObj: null
		};
		this.composer = React.createRef();			

		this.onComposerUserModificationDone = this.onComposerUserModificationDone.bind(this);
	}
	render()
	{
		return (<div>
			<Composer predefinedSetting={this.state.composerPredefinedSetting} onUserModificationDone={this.onComposerUserModificationDone}></Composer>	          
		</div>);
	}

	onComposerUserModificationDone(e)
	{
		this.setState({chemObj: this.composer.current.getWidget().getChemObj()});			
	}
}

export default MyApp;