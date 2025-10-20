import { useState } from 'react';
import { Login } from './components/Login';
import { Chat } from './components/Chat';
import type {User} from './services/api';

function App() {
    const [user, setUser] = useState<User | null>(null);

    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
    };

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <>
            {!user ? (
                <Login onLogin={handleLogin} />
            ) : (
                <Chat user={user} onLogout={handleLogout} />
            )}
        </>
    );
}

export default App;