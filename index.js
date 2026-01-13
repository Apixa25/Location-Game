/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Disable yellow box warnings in development for cleaner testing
LogBox.ignoreLogs([
  'The result of getSnapshot should be cached', // Zustand selector warning
  'Non-serializable values were found in the navigation state',
  'Require cycle:', // Common in RN projects
  'The app is running using the Legacy Architecture', // Expected when Fabric is disabled for ViroReact compatibility
  'Legacy Architecture', // Catch variations of this warning
]);

AppRegistry.registerComponent(appName, () => App);
