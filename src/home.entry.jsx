// The HTML is already on the page (rendered by build.mjs); React attaches to it instead of drawing it again.
import App from "./home.jsx";
ReactDOM.hydrateRoot(document.getElementById("root"), <App/>);
