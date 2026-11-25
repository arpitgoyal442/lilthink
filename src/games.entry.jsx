import { GamesApp } from "./games/index.jsx";
ReactDOM.hydrateRoot(document.getElementById("root"), <GamesApp page={document.body.dataset.page}/>);
