import React from 'react';
import Game from './components/Game';

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0D0C1D] text-white flex flex-col items-center justify-center p-4 font-sans">
            <main>
                <Game />
            </main>
        </div>
    );
};

export default App;
