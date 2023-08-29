// composer.js
import { Kekule } from 'kekule';
import { KekuleReact } from 'kekule-react';
import 'kekule/theme';
import * as THREE from 'three';
import * as Geometry from 'three';

  
Kekule.externalResourceManager.register('three.js', THREE, Geometry);

let Composer = KekuleReact.Utils.wrapWidget(Kekule.Editor.Composer, 
    {
      // reactComponent.props.on[EventName] will be called when Kekule events being invoked in widget 	
      exposeWidgetEvents: true,	       
      // each of widget's property will map to a React component's property. E.g., setting reactComponent.props.chemObj will modify widget.chemObj
      exposeWidgetPropertiesToReactProps: true,
      // explicitly set property names exposed to React
      //exposedProperties: []
      // property names hide from React
      ignoredProperties: ['editorNexus', 'actionMap']
    });

export default Composer;
