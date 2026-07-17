import { useContext } from 'react';
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import Main from "./components/Main/Main.jsx";
import Login from "./components/Login/Login.jsx";
import Settings from "./components/Settings/Settings.jsx";
import { Context } from "./context/Context.jsx";

const App = () => {
    const { user } = useContext(Context);

    if (!user) {
        return <Login />;
    }

    return (
        <>
            <Sidebar/>
            <Main/>
            <Settings/>
        </>
    )
}

export default App;